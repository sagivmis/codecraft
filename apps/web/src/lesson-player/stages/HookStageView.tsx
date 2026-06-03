import { StageScaffold } from './StageScaffold.js';
import type { StageViewProps } from './types.js';

export function HookStageView({ lesson, track, onAdvance, onBack }: StageViewProps) {
  const hook = lesson.stages.hook;
  const variant = lesson.variants[track];

  return (
    <StageScaffold
      title={variant.title}
      description={variant.subtitle ?? ''}
      onBack={onBack}
      canGoBack={false}
      primaryLabel="Let's go"
      onPrimary={() => onAdvance({ status: 'completed' })}
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {hook.visual.kind === 'emoji' ? (
          <span className="text-6xl" aria-label={hook.visual.alt}>
            {hook.visual.src}
          </span>
        ) : (
          <img src={hook.visual.src} alt={hook.visual.alt} className="h-24 w-24 object-contain" />
        )}
        <p className="max-w-md text-lg text-[var(--cc-fg)]">{hook.copy}</p>
      </div>
    </StageScaffold>
  );
}
