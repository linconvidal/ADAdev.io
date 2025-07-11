import React from 'react'

const TwitterIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.7 1.64 1.15c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.91 3.54 4.31-.37.1-.76.16-1.16.16-.28 0-.55-.03-.82-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.87 12.85-12.83 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" fill="#fff"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.369A19.791 19.791 0 0016.885 3.2a.077.077 0 00-.082.038c-.357.63-.755 1.453-1.037 2.104a18.524 18.524 0 00-5.532 0 12.683 12.683 0 00-1.05-2.104.077.077 0 00-.082-.038A19.736 19.736 0 003.684 4.369a.07.07 0 00-.032.027C.533 9.09-.32 13.578.099 18.021a.082.082 0 00.031.056c2.128 1.563 4.195 2.507 6.222 3.13a.077.077 0 00.084-.027c.48-.66.908-1.356 1.273-2.084a.076.076 0 00-.041-.104c-.676-.256-1.32-.568-1.94-.936a.077.077 0 01-.008-.127c.13-.098.26-.2.384-.304a.074.074 0 01.077-.01c4.07 1.86 8.47 1.86 12.51 0a.075.075 0 01.078.009c.124.104.254.206.384.304a.077.077 0 01-.006.127 12.298 12.298 0 01-1.941.936.076.076 0 00-.04.105c.366.728.794 1.423 1.273 2.083a.076.076 0 00.084.028c2.028-.623 4.095-1.567 6.223-3.13a.077.077 0 00.03-.055c.5-5.177-.838-9.637-3.548-13.625a.062.062 0 00-.03-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.96 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z" fill="#fff"/>
  </svg>
)

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="flex justify-center items-center space-x-8 mb-4">
          <a
            href="https://x.com/SLFMR1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:scale-110 transition-transform duration-200"
          >
            <TwitterIcon />
          </a>
          <a
            href="https://discord.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="hover:scale-110 transition-transform duration-200"
          >
            <DiscordIcon />
          </a>
        </div>
        <p className="text-gray-500 text-xs text-center">
          Built for the Cardano Developer Community
        </p>
      </div>
    </footer>
  )
}

export default Footer 