import os, pty, sys, select, time, re
cwd=sys.argv[1]; args=sys.argv[2:]; idle=float(os.environ.get("PREMRUN_IDLE","2.5")); hard=float(os.environ.get("PREMRUN_HARD","15"))
pid,fd=pty.fork()
if pid==0:
    os.chdir(cwd); os.environ["TERM"]="xterm"; os.execvp(args[0],args)
else:
    buf=b""; start=time.time(); last=start
    while True:
        now=time.time()
        if now-start>hard: break
        r,_,_=select.select([fd],[],[],0.2)
        if fd in r:
            try: d=os.read(fd,8192)
            except OSError: break
            if not d: break
            buf+=d; last=now
            if b"\x1b[6n" in d: os.write(fd,b"\x1b[24;80R")
        else:
            if len(buf)>0 and now-last>idle: break
        wpid,_=os.waitpid(pid,os.WNOHANG)
        if wpid==pid: break
    t=buf.decode(errors="replace")
    t=re.sub(r"\x1b\[[0-9;?]*[a-zA-Z]","",t); t=re.sub(r"\x1b[=>\]].?","",t); t=t.replace("\x07","")
    sys.stdout.write(t); sys.stderr.write(f"\n[secs={time.time()-start:.1f}]\n")
    try: os.kill(pid,9); os.waitpid(pid,0)
    except OSError: pass
