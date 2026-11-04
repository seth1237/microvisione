"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";

const why = [
  {
    title: "ISO certified",
    text: "Quality equipment from ISO certified manufacturers, supplied with after-sales service and warranty.",
  },
  {
    title: "Installation and training",
    text: "Setup and operator training can be requested with a quotation. A published training syllabus is still TBC.",
  },
  {
    title: "After-sales service",
    text: "Maintenance, calibration and biomedical support are available as separate service requests.",
  },
  {
    title: "Nationwide Delivery",
    text: "Delivery across Kenya. Timing is confirmed with the quotation.",
  },
];

export function WhySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-black py-16 text-on-dark sm:py-20"
      aria-labelledby="why-heading"
    >
      <Container>
        <div
          className={`transition-all duration-1000 ease-out ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          <h2
            id="why-heading"
            className="inline-block bg-white px-3 py-1 text-3xl font-semibold tracking-tight text-black sm:text-4xl"
          >
            Why Microvision
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-on-dark/80">
            Placeholder copy — replace with approved service descriptions.
            No client counts are shown.
          </p>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {why.map((item, index) => (
            <li
              key={item.title}
              style={{
                transitionDelay: visible ? `${index * 180}ms` : "0ms",
              }}
              className={`group rounded-lg border border-white/15
                bg-white/[0.06] p-6 backdrop-blur-md
                transition-all duration-700 ease-out
                hover:-translate-y-2 hover:border-white/40
                hover:bg-white/[0.12]
                ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
            >
              <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-white">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-on-dark/75 transition-colors duration-300 group-hover:text-on-dark">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
