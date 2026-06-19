export type TextRevealControl = {
  hide: () => Promise<void>;
  show: () => Promise<void>;
};

const pageControls = new Set<TextRevealControl>();

export function registerPageTextReveal(control: TextRevealControl) {
  pageControls.add(control);
  return () => {
    pageControls.delete(control);
  };
}

export async function hideAllRegisteredPageText() {
  await Promise.all([...pageControls].map((c) => c.hide()));
}

export async function showAllRegisteredPageText() {
  await Promise.all([...pageControls].map((c) => c.show()));
}
