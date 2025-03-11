import { ArrowUpRightIcon, GitHubIcon } from "@/components/shared/icons";

export function Footer() {
  return (
    <footer className="mt-8 text-center text-sm text-gray-500">
      <a
        href="https://github.com/t3dotgg/quickpic"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium transition-colors duration-200 hover:text-gray-200 focus:text-gray-200"
      >
        <GitHubIcon />
        {/* <RepositoryIcon strokeWidth={1.5} /> */}
        <span className="inline-flex items-center">
          View on GitHub
          <ArrowUpRightIcon />
        </span>
      </a>
    </footer>
  );
}
