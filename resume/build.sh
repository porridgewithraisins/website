wget -O chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i chrome.deb
sudo apt-get install -fy
cat resume.liquid | npx liquidjs data.json > temp.html
google-chrome --headless --disable-gpu --no-margins --print-to-pdf=../resume.pdf temp.html
sudo apt-get remove google-chrome-stable -y
sudo apt-get autoremove -y
rm chrome.deb
rm temp.html
