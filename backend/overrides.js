const express = require('express');
const mongoose = require('mongoose');

// Keep the existing server intact, but allow the new article-photo workflow to send
// a compressed image as a data URL and provide a structured phone-selection form.
const originalJson = express.json;
express.json = function patchedJson(options = {}) {
  return originalJson({ ...options, limit: '2mb' });
};

const clean = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const wordCount = v => String(v || '').trim().split(/\s+/).filter(Boolean).length;
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const slugify = v => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'security-article';
const now = () => new Date();

function registerBefore(path, handler) {
  const originalPost = express.application.post;
  if (express.application.__siOverrideInstalled) return;
  // Install a one-time wrapper so matching routes are registered before the legacy route.
  express.application.__siOverrideInstalled = true;
  express.application.post = function patchedPost(route, ...handlers) {
    if (route === path) {
      originalPost.call(this, route, handler);
    }
    return originalPost.call(this, route, ...handlers);
  };
}

const articleHandler = async (req, res) => {
  try {
    const b = req.body || {};
    const contentEn = clean(b.contentEn, 25000);
    const contentAr = clean(b.contentAr, 25000);
    const authorImage = clean(b.authorImage, 1800000);
    if (!b.titleEn || !b.titleAr || !b.authorName || !b.category || !b.excerptEn || !b.excerptAr || !contentEn || !contentAr) {
      return res.status(400).json({ message: 'Please complete the article header fields' });
    }
    const wc = Math.max(wordCount(contentEn), wordCount(contentAr));
    if (wc < 700 || wc > 1500) {
      return res.status(400).json({ message: 'Article length must be between 700 and 1500 words / يجب أن يكون طول المقال بين 700 و1500 كلمة' });
    }
    if (b.authorEmail && !validEmail(b.authorEmail)) {
      return res.status(400).json({ message: 'Please enter a valid author email' });
    }
    if (authorImage && !/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(authorImage) && authorImage.length > 300) {
      return res.status(400).json({ message: 'Author photo format is invalid.' });
    }
    const collection = mongoose.connection.collection('securityarticles');
    let slug = slugify(clean(b.titleEn || b.titleAr, 180));
    let suffix = 0;
    while (await collection.findOne({ slug })) {
      suffix += 1;
      slug = slugify(clean(b.titleEn || b.titleAr, 180)) + '-' + suffix;
    }
    const doc = {
      slug,
      titleEn: clean(b.titleEn, 180),
      titleAr: clean(b.titleAr, 180),
      authorName: clean(b.authorName, 120),
      authorTitle: clean(b.authorTitle, 160),
      authorEmail: clean(b.authorEmail, 180).toLowerCase(),
      authorImage,
      category: clean(b.category, 120),
      excerptEn: clean(b.excerptEn, 700),
      excerptAr: clean(b.excerptAr, 700),
      contentEn,
      contentAr,
      sourceLanguage: b.sourceLanguage === 'ar' ? 'ar' : 'en',
      status: 'pending',
      rejectionReason: '',
      reviewedAt: null,
      createdAt: now(),
      updatedAt: now()
    };
    await collection.insertOne(doc);
    return res.status(201).json({ ok: true, id: String(doc._id), slug: doc.slug, status: doc.status });
  } catch (e) {
    console.error('article override error', e);
    return res.status(500).json({ message: 'Unable to save article' });
  }
};

registerBefore('/api/articles', articleHandler);
