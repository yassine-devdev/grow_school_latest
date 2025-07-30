import Link from "next/link";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

import { Metadata } from "next";
import { Button } from "../ui/button";

/**
 * Interface for version data structure
 */
interface VersionData {
  version: string;
  status: string;
  changes: string[];
  notes: string[];
  date: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  founderNotes?: string;
  branch?: string;
}

export const metadata: Metadata = {
  title: "Version History | Your Software Name",
  description: "Explore the version history and changelog of our software.",
};

export default function VersionChangeLog() {
  const versions: VersionData[] = [
    {
      version: "7.0.0",
      status: "STABLE",
      changes: [
        "Complete rewrite with modern React patterns",
        "Improved timeline performance",
        "Enhanced overlay system",
        "Better autosave and recovery",
        "TypeScript support throughout"
      ],
      notes: [
        "This is our biggest release yet",
        "Complete rewrite for better performance",
        "Improved user experience throughout"
      ],
      date: "2024-01-15",
      title: "Major Release - Complete Rewrite",
      description: "Complete rewrite of the video editor with modern React patterns and improved performance.",
      image: "/placeholder-image.jpg",
      video: "/placeholder-video.mp4",
      founderNotes: "This is our biggest release yet with a complete rewrite for better performance and user experience.",
      branch: "main"
    }
  ];

  return (
    <section>
      <div className="relative min-h-screen mx-auto mt-8 lg:px-24 max-w-7xl md:mt-0">
        <div className="max-w-xl lg:text-balance">
          <span className="text-xs font-medium text-blue-300 uppercase">
            Release History
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white lg:text-4xl sm:text-balance">
            Version Changelog
          </h1>
          <p className="mt-6 text-sm font-light text-zinc-300">
            Track our React Video Editors evolution and explore new features,
            improvements, and bug fixes with each release. Each version will
            link you to the working version of the editor.
          </p>
        </div>
        <div className="relative sm:pb-12 sm:ml-[calc(2rem+1px)] md:ml-[calc(3.5rem+1px)] lg:ml-[max(calc(14.5rem+1px),calc(100%-80rem))] ">
          <div className="hidden absolute top-3 bottom-0 right-full mr-7 md:mr-[3.25rem] w-px bg-slate-200 sm:block "></div>
          <div className="mt-10 md:space-y-10 md:mt-20">
            {versions.map((version: VersionData, index: number) => (
              <article
                key={version.version}
                className={`relative group bg-slate-800 md:p-8 p-4 md:mb-0 mb-10 rounded-lg border border-gray-700 ${
                  version.status !== "Archived" ? "hover:border-blue-200" : ""
                }`}
              >
                <div
                  className={`absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl duration-300 ${
                    version.status === "Archived" ? "pointer-events-none" : ""
                  }`}
                ></div>
                <svg
                  viewBox="0 0 9 9"
                  className={`hidden absolute right-full mr-6 top-2  md:mr-[45.5px] w-[calc(0.5rem+8px)] h-[calc(0.5rem+8px)] overflow-visible sm:block ${
                    index === 0
                      ? "animate-bounce text-blue-500 "
                      : "text-blue-300 "
                  }`}
                >
                  <circle
                    cx="4.5"
                    cy="4.5"
                    r="4.5"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="fill-white"
                  ></circle>
                </svg>
                <div className="relative">
                  {version.status === "Archived" && (
                    <div className="p-4 mb-6 border border-red-700 rounded-lg bg-red-900/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-400">
                            Archived Version Notice
                          </h4>
                          <p className="mt-1 text-xs text-red-300">
                            This version has been removed from the codebase and
                            is no longer supported. We recommend using a more
                            recent version. If you need access to this version,
                            please contact support.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="pt-8 text-lg font-medium tracking-tight text-blue-200 md:text-2xl lg:pt-0">
                      Version {version.version}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        index === 0
                          ? "bg-amber-400/10 text-amber-400 ring-amber-400/30"
                          : version.status === "Archived"
                          ? "bg-red-400/10 text-red-400 ring-red-400/30"
                          : version.status === "Latest"
                          ? "bg-purple-400/10 text-purple-400 ring-purple-400/30"
                          : "bg-green-400/10 text-green-400 ring-green-400/30"
                      }`}
                    >
                      {version.status || "Stable"}
                    </span>
                  </div>
                  <div className="mt-2 mb-4 text-xs md:text-sm lg:text-sm text-zinc-100 ">
                    <p>{version?.description || "No description available."}</p>
                  </div>
                  <div className="mb-0 border-t border-gray-700"></div>

                  {version.branch && (
                    <div className="flex items-center gap-3 py-4 text-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Branch:</span>
                          <code className="px-2 py-0.5 rounded bg-slate-700/50 text-blue-300 border border-slate-600">
                            {version.branch}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mb-4 border-t border-gray-700"></div>
                  {version.status === "BETA" && (
                    <div className="p-4 mb-6 border rounded-lg bg-amber-900/20 border-amber-700">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-400">
                            Beta Version
                          </h4>
                          <p className="mt-1 text-xs text-amber-300">
                            This version is in beta. We welcome you to try it
                            out and would appreciate any feedback or issues you
                            encounter.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(version.video || version.image) && (
                    <div className="mb-6 overflow-hidden rounded-lg">
                      {version.video ? (
                        <video
                          className="object-cover w-full aspect-video"
                          controls
                          src={version.video}
                        />
                      ) : (
                        version.image && (
                          <Image
                            src={version.image}
                            alt={`Version ${version.version} preview`}
                            width={800}
                            height={450}
                            className="object-cover w-full"
                          />
                        )
                      )}
                    </div>
                  )}

                  <h4 className="mb-3 text-sm font-medium text-blue-300">
                    Features & Changes
                  </h4>
                  <ul className="mt-2 space-y-2 list-none">
                    {version?.changes?.map((change: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-blue-300">•</span>
                        <span className="text-xs text-zinc-100 md:text-sm">
                          {change}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <dl className="absolute left-0 top-0 tracking-tight text-lg font-medium text-zinc-300 lg:left-auto lg:right-full lg:mr-[calc(6.5rem+1px)]">
                    <dt className="sr-only">{version.date}</dt>
                    <dd className="text-xs whitespace-nowrap md:text-base">
                      <time dateTime={version.date}>{version.date}</time>
                    </dd>
                  </dl>
                  {version.founderNotes && (
                    <div className="p-4 mt-8 border rounded-lg bg-slate-700/50 md:p-6 border-slate-600">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-sm font-medium text-blue-300">
                          Developer Notes
                        </h4>
                      </div>
                      <div className="space-y-4 text-xs leading-relaxed md:text-sm text-zinc-100">
                        {version.founderNotes.split("||").map((note: string, index: number) => (
                          <p key={index}>{note.trim()}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {index === 0 && (
                  <Link
                    href={`/versions/${version.version}`}
                    className="flex items-center mt-6 text-sm font-medium text-blue-300"
                  >
                    <span className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl"></span>
                    <Button
                      variant="outline"
                      className="relative flex items-center gap-2 text-sm font-medium duration-300 dark:text-white text-slate-900"
                    >
                      View this version
                    </Button>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
