import Link from "next/link";
import Image from "next/image";

const tools = [
  {
    href: "/svg-to-png",
    title: "SVG to PNG Converter",
    description: "Convert and scale SVG files to high-quality PNG images",
    image: "/png-svg.jpg",
    placeholderColor: "bg-blue-500",
  },
  {
    href: "/square-image",
    title: "Square Image Generator",
    description: "Transform any image into a perfect square without distortion",
    image: "/square-tool.jpg",
    placeholderColor: "bg-purple-500",
  },
  {
    href: "/rounded-border",
    title: "Corner Rounder",
    description: "Add smooth rounded corners to your images with ease",
    image: "/rounding-tool.jpg",
    placeholderColor: "bg-green-500",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="flex flex-grow flex-col items-center justify-center">
        <div className="mb-12 text-center">
          Hi. I&apos;m{" "}
          <a
            href="https://twitter.com/t3dotgg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Theo
          </a>
          . I built these tools because I was annoyed they did not exist.
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col hover:scale-[1.02] rounded-lg border border-gray-200 bg-white/10 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/10"
            >
              <div className="mb-4 aspect-square w-full overflow-hidden rounded-lg">
                {tool.image ? (
                  <Image
                    src={tool.image}
                    alt={tool.title}
                    width={250}
                    height={250}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={`h-full w-full ${tool.placeholderColor}`} />
                )}
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                {tool.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <a
          href="https://github.com/t3dotgg/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
