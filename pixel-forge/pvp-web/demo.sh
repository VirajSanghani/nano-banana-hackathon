#!/bin/bash

# Pixel-Forge PvP Demo Launcher
# Revolutionary AI Combat Arena - Demo Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ASCII Art Logo
print_logo() {
    echo -e "${CYAN}"
    echo "    ██████╗ ██╗██╗  ██╗███████╗██╗      ███████╗ ██████╗ ██████╗  ██████╗ ███████╗"
    echo "    ██╔══██╗██║╚██╗██╔╝██╔════╝██║      ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝"
    echo "    ██████╔╝██║ ╚███╔╝ █████╗  ██║█████╗█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  "
    echo "    ██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║╚════╝██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  "
    echo "    ██║     ██║██╔╝ ██╗███████╗███████╗ ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗"
    echo "    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝"
    echo ""
    echo "                        🚀 Revolutionary AI Combat Arena 🚀"
    echo "                     ⚔️ Create Weapons • 🌀 Dynamic Physics • ⚡ Real-Time PvP"
    echo -e "${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print section headers
print_section() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🔧 $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}\n"
}

# Print step info
print_step() {
    echo -e "${BLUE}▶️ $1${NC}"
}

# Print success message
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Print warning message
print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Print error message
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check system requirements
check_requirements() {
    print_section "Checking System Requirements"
    
    local all_good=true
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node --version)
        print_success "Node.js found: $node_version"
    else
        print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
        all_good=false
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version=$(npm --version)
        print_success "npm found: $npm_version"
    else
        print_error "npm not found. Please install npm"
        all_good=false
    fi
    
    # Check Python
    if command_exists python3; then
        local python_version=$(python3 --version)
        print_success "Python found: $python_version"
    elif command_exists python; then
        local python_version=$(python --version)
        print_success "Python found: $python_version"
    else
        print_error "Python not found. Please install Python 3.8+ from https://python.org/"
        all_good=false
    fi
    
    # Check pip
    if command_exists pip3; then
        print_success "pip3 found"
    elif command_exists pip; then
        print_success "pip found"
    else
        print_error "pip not found. Please install pip"
        all_good=false
    fi
    
    if [ "$all_good" = false ]; then
        print_error "Please install missing requirements and run this script again."
        exit 1
    fi
}

# Setup environment
setup_environment() {
    print_section "Setting Up Environment"
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        print_step "Creating .env file..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env file created from .env.example"
            print_warning "Please add your GEMINI_API_KEY to the .env file!"
        else
            echo "GEMINI_API_KEY=your_google_gemini_api_key_here" > .env
            echo "HOST=0.0.0.0" >> .env
            echo "PORT=8000" >> .env
            echo "DEBUG=true" >> .env
            print_success ".env file created with default settings"
            print_warning "Please add your GEMINI_API_KEY to the .env file!"
        fi
        
        echo -e "\n${YELLOW}📝 To get a Gemini API key:${NC}"
        echo "1. Go to https://makersuite.google.com/app/apikey"
        echo "2. Create a new API key"
        echo "3. Add it to your .env file: GEMINI_API_KEY=your_key_here"
        echo ""
        read -p "Press Enter after adding your API key to continue..."
    else
        print_success ".env file already exists"
    fi
}

# Install backend dependencies
install_backend() {
    print_section "Installing Backend Dependencies"
    
    if [ -d "backend" ]; then
        cd backend
        
        print_step "Installing Python packages..."
        if command_exists pip3; then
            pip3 install -r requirements.txt
        else
            pip install -r requirements.txt
        fi
        
        print_success "Backend dependencies installed successfully"
        cd ..
    else
        print_error "Backend directory not found!"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend() {
    print_section "Installing Frontend Dependencies"
    
    if [ -d "frontend" ]; then
        cd frontend
        
        print_step "Installing Node.js packages..."
        npm install
        
        print_success "Frontend dependencies installed successfully"
        cd ..
    else
        print_error "Frontend directory not found!"
        exit 1
    fi
}

# Start backend server
start_backend() {
    print_section "Starting Backend Server"
    
    cd backend
    
    print_step "Launching FastAPI server on http://localhost:8000"
    print_step "Backend features: WebSocket multiplayer, AI weapon generation, physics engine"
    
    if command_exists python3; then
        python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    else
        python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    fi
    
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    print_success "Backend server started (PID: $BACKEND_PID)"
    cd ..
    
    # Wait for backend to start
    print_step "Waiting for backend to initialize..."
    sleep 5
}

# Start frontend server
start_frontend() {
    print_section "Starting Frontend Server"
    
    cd frontend
    
    print_step "Launching React + Phaser.js client on http://localhost:5173"
    print_step "Frontend features: Real-time UI, Phaser game engine, weapon generation interface"
    
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    print_success "Frontend server started (PID: $FRONTEND_PID)"
    cd ..
    
    # Wait for frontend to start
    print_step "Waiting for frontend to build..."
    sleep 3
}

# Open browser
open_game() {
    print_section "Launching Game"
    
    local url="http://localhost:5173"
    
    print_step "Opening browser to $url"
    
    # Try to open browser based on OS
    if command_exists xdg-open; then
        xdg-open "$url" 2>/dev/null &
    elif command_exists open; then
        open "$url" 2>/dev/null &
    elif command_exists start; then
        start "$url" 2>/dev/null &
    else
        print_warning "Could not auto-open browser. Please manually open: $url"
    fi
    
    print_success "Game should now be loading in your browser!"
}

# Display game instructions
show_instructions() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}🎮 GAME INSTRUCTIONS${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}🎯 How to Play:${NC}"
    echo "1. Enter your battle name on the main menu"
    echo "2. Click 'Enter Battle Arena' to find a match"
    echo "3. Use WASD to move, mouse to aim and shoot"
    echo "4. Create weapons by typing prompts like 'fire sword', 'ice cannon', 'lightning bow'"
    echo "5. Battle other players to be the last one standing!"
    echo ""
    
    echo -e "${YELLOW}⌨️ Controls:${NC}"
    echo "• WASD - Move character"
    echo "• Mouse - Aim weapons"
    echo "• Left Click - Fire current weapon"
    echo "• Numbers 1-5 - Switch weapons"
    echo "• TAB - Toggle performance stats"
    echo "• L - Toggle leaderboard"
    echo "• ESC - Pause menu"
    echo ""
    
    echo -e "${YELLOW}⚔️ Weapon Generation Examples:${NC}"
    echo "• 'fire sword' - Create a flaming melee weapon"
    echo "• 'ice cannon' - Generate a freezing projectile weapon"
    echo "• 'lightning bow' - Craft an electric ranged weapon"
    echo "• 'poison dagger' - Make a toxic close-combat weapon"
    echo "• 'healing staff' - Create a supportive utility weapon"
    echo ""
    
    echo -e "${YELLOW}🌀 Master Prompts (Physics Modifications):${NC}"
    echo "• 'low gravity' - Reduce gravitational pull"
    echo "• 'bouncy world' - Make surfaces more elastic"
    echo "• 'ice floor' - Reduce friction for slippery movement"
    echo "• 'slow motion' - Reduce game time scale"
    echo "• 'high gravity' - Increase downward force"
    echo ""
    
    echo -e "${YELLOW}🏆 Victory Conditions:${NC}"
    echo "• Last player standing wins"
    echo "• Matches last up to 90 seconds"
    echo "• Highest health wins if time runs out"
    echo "• Most kills breaks ties"
}

# Monitor servers
monitor_servers() {
    print_section "Server Status"
    
    echo -e "${GREEN}🟢 Backend Server: http://localhost:8000${NC}"
    echo -e "${GREEN}🟢 Frontend Server: http://localhost:5173${NC}"
    echo -e "${GREEN}🟢 Game Client: http://localhost:5173${NC}"
    echo ""
    
    echo -e "${YELLOW}📊 Real-time Features Active:${NC}"
    echo "• WebSocket multiplayer communication"
    echo "• AI weapon generation pipeline"
    echo "• Dynamic physics modification system"
    echo "• 60 FPS game loop with client prediction"
    echo "• Automatic reconnection handling"
    echo ""
    
    echo -e "${BLUE}💡 Technical Highlights:${NC}"
    echo "• Sub-3-second weapon generation"
    echo "• Authoritative server architecture"
    echo "• Real-time physics rule changes"
    echo "• Cross-platform web deployment"
    echo "• Advanced AI integration with Gemini 2.5 Flash"
    echo ""
    
    echo -e "${CYAN}🔧 Press Ctrl+C to stop all servers${NC}"
    
    # Wait for user to interrupt
    wait
}

# Cleanup function
cleanup() {
    print_section "Stopping Servers"
    
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        print_step "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        rm backend.pid
    fi
    
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        print_step "Stopping frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        rm frontend.pid
    fi
    
    # Kill any remaining processes
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    print_success "All servers stopped successfully"
    echo -e "\n${CYAN}Thanks for playing Pixel-Forge PvP! 🎮⚔️${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_logo
    
    # Check if we're in the right directory
    if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the pvp-web directory"
        print_error "Expected structure: pvp-web/backend/ and pvp-web/frontend/"
        exit 1
    fi
    
    # Run setup steps
    check_requirements
    setup_environment
    install_backend
    install_frontend
    
    # Start servers
    start_backend
    start_frontend
    
    # Launch game
    open_game
    show_instructions
    
    # Monitor until interrupted
    monitor_servers
}

# Run main function
main "$@"