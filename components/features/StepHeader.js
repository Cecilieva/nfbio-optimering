import BackLink from "@/components/ui/BackLink";

/**
 * The top of each step in the booking flow: back link, step number and title.
 *
 * @param {object} props
 * @param {number} props.step
 * @param {number} [props.totalSteps=4]
 * @param {string} props.title
 * @param {string} [props.backHref]
 */
export default function StepHeader({ step, totalSteps = 4, title, backHref }) {
  return (
    <div>
      {/* Figma "Knap", Type=Tilbage – samme knap som på filmsiden */}
      {backHref && <BackLink href={backHref} />}
      <p>
        Trin {step} af {totalSteps}
      </p>
      <h1>{title}</h1>
    </div>
  );
}
