echo "Welcome to Eafoo's terminal workspace! 🚀"
sleep 2
echo "I'm thrilled to show you around. Let's explore the structure and the interactive pieces that bring this environment to life."
sleep 2
echo "I'll enable command echo so you can follow along with exactly what's happening."
sleep 2
set -v
typing 10
pace 1000
# We start at the root (~/). It behaves like a mini filesystem!
pwd
ls
preview ~/description.md
# Let's dive into the profile section - this is the core resume view.
cd ~/profile
ls
preview about.md
# Next up: scripts. These are standard shell flows you can inspect and reuse.
cd ~/scripts
ls
preview welcome.sh # This is the script we're running right now!
# Now for the fun part: Plugins! These add visual docks and animated background layers.
cd ~/plugins
ls
preview music-card.plg
plugin music-card.plg
plugin cyber-particles.plg
# They look amazing, but let's toggle them back off before we move on to keep the terminal clean.
plugin cyber-particles.plg
plugin music-card.plg
# Programs are interactive, blocking terminal sessions.
cd ~/programs
ls
preview js-calculator.exe
# That concludes the grand tour!
# To start roaming freely, just type: help
pace 0
typing 0
set +v