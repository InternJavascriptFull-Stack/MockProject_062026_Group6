import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
} from "../icon/icon";

const socialLinks = [
  { icon: FacebookIcon, href: "#" },
  { icon: TwitterIcon, href: "#" },
  { icon: InstagramIcon, href: "#" },
  { icon: YoutubeIcon, href: "#" },
  { icon: LinkedinIcon, href: "#" },
];

const footerLinks = [
  "Privacy Policy",
  "Terms & Conditions",
  "Contact",
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <p className="font-medium text-[#233955]">
            Copyright © 2024 Peterdraw
          </p>

          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[#87888A] transition-colors hover:text-[#233955]"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 pr-5">
          {socialLinks.map(({ icon: Icon, href }, index) => (
            <a
              key={index}
              href={href}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-[#EEF7F7] hover:text-[#233955]"
            >
              <Icon className="h-5 w-5 text-[#87888A]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
