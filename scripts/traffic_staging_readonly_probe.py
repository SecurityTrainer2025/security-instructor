#!/usr/bin/env python3
"""Read-only HTTP status checks of SI Traffic staging. No POST, credentials, or redirects."""
import json, pathlib, datetime, urllib.request, urllib.error
from urllib.parse import urlsplit
targets=[
  ("backend_health","https://si-avs-staging-test.onrender.com/health"),
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
            body=response.read(120000).decode("utf-8","replace")
        if result["reachable"] and name=="frontend_config":
            result["registration_safely_disabled"]=("SI_TRAFFIC_STAGING_API = ''" in body or 'SI_TRAFFIC_STAGING_API = ""' in body)
            if not result["registration_safely_disabled"]:
                raise RuntimeError("Staging frontend config unexpectedly enables a backend")
        if result["reachable"] and name=="frontend_learner":
            result["expected_traffic_page"]="Traffic Control Self-Study" in body and "STAGING_READY" in body
        if result["reachable"] and name=="frontend_registration":
            result["expected_traffic_page"]="Traffic Control Self-Study Registration" in body and "STAGING_READY" in body
        result["detail"]="Response and preview safety guard inspected; does not certify staging MongoDB separation or QR."
    except urllib.error.HTTPError as e:
        result["http_status"]=e.code
        if name=="backend_catalog" and e.code==404:
            result["disabled_as_expected"]=True
            result["detail"]="Traffic course is correctly hidden while rollout flag is OFF."
        else:
            result["detail"]="Non-200 response or redirect; manual review needed."
    except Exception as e:
        result["detail"]="Connection could not be verified: "+type(e).__name__
    print(f"{name}: {result['http_status']} reachable={result['reachable']}",flush=True)
    results.append(result)
report={"checked_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"production_activation":"BLOCKED","writes":False,"emails_sent":False,"certificates_issued":False,"real_qr_verified":False,"staging_targets":results}
p=pathlib.Path("/tmp/si-traffic-staging-availability.json")
p.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("REPORT "+str(p))
by_name={r["target"]:r for r in results}
assert by_name["backend_health"]["http_status"]==200, "Staging backend health failed"
assert by_name["backend_catalog"].get("disabled_as_expected") is True, "Traffic course must remain hidden until approved"
assert all(by_name[n].get("expected_traffic_page") is True for n in ("frontend_learner","frontend_registration")), "Traffic HTML mismatch"
assert by_name["frontend_config"].get("registration_safely_disabled") is True, "Frontend registration must remain off"
print("PASS: staging backend healthy, Traffic catalog hidden, review pages live, registration disabled, no writes")
