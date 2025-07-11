# ADAdev: Cardano Developer Resources

A modern web application showcasing Cardano development resources with AI-powered tool recommendations.

## Features

- **AI-Powered Search**: Describe what you want to build and get personalized tool recommendations
- **Comprehensive Resource Library**: Browse tools, APIs, and libraries for Cardano development
- **GitHub Integration**: Real-time updates from Cardano projects
- **Development Plans**: AI-generated development plans with copy-to-clipboard functionality
- **Modern UI**: Dark mode design inspired by modal.com

## AI Features

### Smart Tool Recommendations
- Input your project requirements in natural language
- AI analyzes your needs and recommends the best Cardano tools
- Get prioritized recommendations with explanations

### Development Plans
- AI generates comprehensive development plans
- Multiple approach options with complexity levels
- Copy plans to clipboard in markdown format
- Interactive widget with detailed breakdowns

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adaDEV
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OpenAI API**
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     VITE_OPENAI_API_KEY=your_openai_api_key_here
     ```
   - Get your API key from: https://platform.openai.com/api-keys

4. **Start development server**
   ```bash
   npm run dev
   ```

## Usage

### AI Search
1. Go to the hero section
2. Describe what you want to build (e.g., "I want to create a DeFi lending platform")
3. Click the search button or press Enter
4. View AI-recommended tools and development plan

### Browse Resources
1. Use the search bar to find specific tools
2. Filter by category using the dropdown
3. Click on resource cards for detailed information
4. View GitHub updates for active projects

### Development Plans
1. After AI analysis, click "View Development Plan"
2. Explore different development approaches
3. Copy the full plan to clipboard in markdown format
4. Use the plan to guide your Cardano development

## Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber
- **AI Integration**: OpenAI GPT-4
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── AISearchInput.jsx      # AI search input component
│   ├── AIResults.jsx          # AI results display
│   ├── AIWidget.jsx           # Development plan widget
│   ├── BlockAnimation.jsx     # 3D background animation
│   ├── CustomDropdown.jsx     # Custom dropdown component
│   ├── Footer.jsx             # Footer component
│   ├── GitHubUpdates.jsx      # GitHub updates component
│   ├── GitHubUpdatesSection.jsx # GitHub updates section
│   ├── Header.jsx             # Header component
│   ├── Hero.jsx               # Hero section with AI search
│   ├── ResourceCard.jsx       # Resource card component
│   ├── ResourceGrid.jsx       # Resource grid component
│   └── SearchBar.jsx          # Search bar component
├── data/
│   └── resources.js           # Cardano resources data
├── services/
│   ├── ai.js                  # OpenAI integration
│   └── github.js              # GitHub API integration
├── App.jsx                    # Main app component
├── index.css                  # Global styles
└── main.jsx                   # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support or questions, please open an issue on GitHub. 