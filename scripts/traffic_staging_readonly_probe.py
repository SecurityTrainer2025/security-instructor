#!/usr/bin/env python3
"""Read-only HTTP status checks of SI Traffic staging. No POST, credentials, or redirects."""
import json, pathlib, datetime, urllib.request, urllib.error
from urllib.parse import urlsplit
targets=[
  ("backend_catalog","https://si-avs-staging-test.onrender.com/api/self-study/courses/traffic-management-vehicle-control"),
  ("frontend_learner","https://si-staging-ui.onrender.com/traffic-self-study.html"),
  ("frontend_registration","https://si-staging-ui.onrender.com/traffic-self-study-register.html"),
  ("frontend_config","https://si-staging-ui.onrender.com/traffic-staging-config.js"),
]
allowed={"si-avs-staging-test.onrender.com","si-staging-ui.onrender.com"}
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        raise urllib.error.HTTPError(req.full_url,code,"Redirect blocked",headers,fp)
opener=urllib.request.build_opener(NoRedirect())
results=[]
for name,url in targets:
    assert urlsplit(url).hostname in allowed
    result={"target":name,"http_status":None,"reachable":False,"detail":""}
    try:
        request=urllib.request.Request(url,method="GET",headers={"User-Agent":"SI-Traffic-Review-Only/1.0","Accept":"text/html, application/json"})
        with opener.open(request,timeout=12) as response:
            result["http_status"]=response.status
            result["reachable"]=response.status==200
            response.read(256)
        result["detail"]="Response observed; this does not confirm staging database isolation or certification readiness."
    except urllib.error.HTTPError as e:
        result["http_status"]=e.code
        result["detail"]="Non-200 response or redirect; manual review needed."
    except Exception as e:
        result["detail"]="Connection could not be verified: "+type(e).__name__
    print(f"{name}: {result['http_status']} reachable={result['reachable']}",flush=True)
    results.append(result)
report={"checked_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"production_activation":"BLOCKED","writes":False,"emails_sent":False,"certificates_issued":False,"real_qr_verified":False,"staging_targets":results}
p=pathlib.Path("/tmp/si-traffic-staging-availability.json")
p.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("REPORT "+str(p))
