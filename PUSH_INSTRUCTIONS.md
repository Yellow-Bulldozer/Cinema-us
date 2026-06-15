Run these scripts from the project root (the folder containing `backend/` and `frontend/`).

Bash (Git Bash, WSL, macOS, Linux):
```bash
chmod +x scripts/push-to-github.sh
./scripts/push-to-github.sh https://github.com/Yellow-Bulldozer/Cinema-us.git
```

PowerShell (Windows):
```powershell
.
scripts\push-to-github.ps1 -RemoteUrl "https://github.com/Yellow-Bulldozer/Cinema-us.git"
```

Notes:
- The scripts will initialize a git repo if one doesn't exist, create or update a commit, set `main` branch, add the `origin` remote, and push.
- For HTTPS pushes you will be prompted for credentials; prefer a GitHub Personal Access Token (PAT) in place of your password.
- If you prefer SSH, pass the SSH remote URL (e.g. `git@github.com:Yellow-Bulldozer/Cinema-us.git`). Make sure your SSH key is loaded.
- I won't request or store credentials. Run the script locally so your credentials remain on your machine.
