// @ts-nocheck

export type TextRevealControl = {
  hide: () => Promise<void>;
  show: () => Promise<void>;
};

const pageControls = new Set<TextRevealControl>();
const menuControls = new Set<TextRevealControl>();

export function registerPageTextReveal(control: TextRevealControl) {
  pageControls.add(control);
  return () => {
    pageControls.delete(control);
  };
}

export function registerMenuTextReveal(control: TextRevealControl) {
  menuControls.add(control);
  return () => {
    menuControls.delete(control);
  };
}

export async function hideAllRegisteredPageText() {
  await Promise.all([...pageControls].map((c) => c.hide()));
}

export async function showAllRegisteredPageText() {
  await Promise.all([...pageControls].map((c) => c.show()));
}

export async function hideAllRegisteredMenuText() {
  await Promise.all([...menuControls].map((c) => c.hide()));
}

export async function showAllRegisteredMenuText() {
  await Promise.all([...menuControls].map((c) => c.show()));
}
