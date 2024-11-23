# LogicMonitor Collector Calculator

A web-based tool for capacity planning and sizing of LogicMonitor collectors. This calculator helps users determine the optimal number and size of collectors needed for their monitoring environment.

## Overview

The LogicMonitor Collector Calculator is designed to help users:
- Plan collector deployment across multiple sites
- Calculate monitoring load based on device types and collection methods
- Determine optimal collector sizes
- Account for failover requirements
- Plan for log collection capacity

## Features

- **Multi-Site Planning**: Configure multiple monitoring sites with different device profiles
- **Device Type Management**: 
  - Pre-configured device templates
  - Custom device type creation
  - Configurable collection methods and weights
- **Capacity Visualization**:
  - Real-time load calculations
  - Visual collector distribution
  - Automatic sizing recommendations
- **Configuration Management**:
  - Export/Import configurations
  - Save and load different scenarios
  - Bulk site management

## Collector Sizes

| Size   | Max Weight | Max EPS  | Recommended Use Case |
|--------|------------|----------|---------------------|
| XXL    | 100,000    | 52,817   | Large enterprise deployments |
| XL     | 35,000     | 37,418   | Large environments |
| LARGE  | 25,000     | 23,166   | Medium to large deployments |
| MEDIUM | 12,500     | 13,797   | Small to medium deployments |
| SMALL  | 10,000     | 7,800    | Small deployments |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/stevevillardi/logicmonitor-calculator.git
```

2. Install dependencies:

```bash
cd logicmonitor-calculator
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Configure Sites**:
   - Add new monitoring sites
   - Specify device counts and types
   - Configure log collection requirements

2. **Adjust Settings**:
   - Modify collection method weights
   - Set maximum load thresholds
   - Configure failover requirements

3. **Review Results**:
   - View recommended collector sizes
   - Check load distribution
   - Verify failover coverage

## Technology Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- Lucide Icons

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For product support, please visit [LogicMonitor Support](https://www.logicmonitor.com/support) or for support with this calculator, open an issue in the GitHub repository.

---

For more information about LogicMonitor, visit [www.logicmonitor.com](https://www.logicmonitor.com)