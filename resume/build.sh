wget -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i chrome.deb
sudo apt-get install -fy
google-chrome --headless --disable-gpu --no-margins --print-to-pdf=../resume.pdf raw.html

# if its a github action, clean up (based on args 0)
# if its not, quit

if ["$1" == "github"]; then
    echo "Not cleaning up"
    exit 0
else
    echo "Cleaning up"
fi

sudo apt-get remove google-chrome-stable -y
sudo apt-get autoremove -y
rm chrome.deb
