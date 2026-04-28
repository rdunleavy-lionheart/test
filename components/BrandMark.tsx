"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  /** Optional tag shown to the right of the logo (e.g. "Marketing Allocation Brief"). */
  tag?: string;
};

const LOGO_SRC = "/lionheart-logo.png";

export default function BrandMark({ tag }: Props) {
  const [hasLogo, setHasLogo] = useState(true);

  return (
    <div className="brand-lockup">
      {hasLogo ? (
        <Image
          src={LOGO_SRC}
          alt="Lionheart Children's Academy"
          width={220}
          height={68}
          priority
          className="brand-logo"
          onError={() => setHasLogo(false)}
        />
      ) : (
        <div className="brand-mark" aria-label="Lionheart Children's Academy">
          li<span className="leaf">o</span>nheart
        </div>
      )}
      {tag && <div className="brand-tag">{tag}</div>}
    </div>
  );
}
