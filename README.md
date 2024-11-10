> "I wanted a better way to upscale svgs as pngs so I built it. Also wanted a better way to make images into squares. Open source because why not. Free because it only runs on client." - Theo

## QuickPic - Tools For Pictures (By Theo)

A powerful browser-based image manipulation tool that specializes in:
- SVG to PNG conversion with customizable scaling
- Image squaring (padding or cropping to perfect squares)
- Image corner rounding
- All processing happens client-side for speed and privacy

## Features

### SVG to PNG Conversion
- High-quality SVG rendering to PNG **format**
- Customizable output dimensions
- Maintains transparency
- No server uploads required

### Image Squaring
- Convert any rectangular image to a perfect square
- Two modes:
  - Padding mode (adds background)
  - Crop mode (intelligent centering)

### Corner Rounding
- Apply rounded corners to any image
- Adjustable corner radius
- Preview before saving

## Technology Stack
- Next.js for the frontend framework
- Client-side processing using browser Canvas API
- PNPM for package management
- Modern React patterns and hooks

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PNPM package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quickpic.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
```


## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Update documentation as needed

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments
- Original concept and development by Theo
- All contributors and users of the project

