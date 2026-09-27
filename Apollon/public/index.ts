import * as Apollon from '../src/main';
import * as themings from './themings.json';
import('./styles.css');

const container = document.getElementById('apollon')!;
let editor: Apollon.ApollonEditor | null = null;
let options: Apollon.ApollonOptions = {
  model: JSON.parse(window.localStorage.getItem('apollon')!),
  colorEnabled: true,
  scale: 0.8,
  type: 'ClassDiagram',
  mode: Apollon.ApollonMode.Modelling
};

export async function mountApollon(
  container: HTMLElement,
  initialOptions?: Partial<Apollon.ApollonOptions> & { model?: Apollon.UMLModel }
) {
  const passedModel = initialOptions?.model;

  options = {
    ...options,
    ...initialOptions,
    model: passedModel,
  };

  if (passedModel !== undefined) {
    localStorage.setItem('apollon', JSON.stringify(passedModel));
  }

  if (editor) {
    editor.destroy();
  }

  editor = new Apollon.ApollonEditor(container, options);
  await editor.nextRender; // Wait for initialization
  return editor;
}

export function unmountApollon() {
  if (editor) {
    editor.destroy();
    editor = null;
  }
}

export const onChange = (event: MouseEvent) => {
  const { name, value } = event.target as HTMLSelectElement;
  options = { ...options, [name]: value };
  render();
};

export const onSwitch = (event: MouseEvent) => {
  const { name, checked: value } = event.target as HTMLInputElement;
  options = { ...options, [name]: value };
  render();
};

export const save = async () => {
  if (!editor) return;

  await editor.nextRender; // Ensure editor is ready
  const model: Apollon.UMLModel = editor.model;
  localStorage.setItem('apollon', JSON.stringify(model));
  options = { ...options, model };
  return options;
};

export const clear = () => {
  localStorage.removeItem('apollon');
  options = { ...options, model: undefined };
};

export const setTheming = (theming: string) => {
  const root = document.documentElement;
  const selectedButton = document.getElementById(
    theming === 'light' ? 'theming-light-mode-button' : 'theming-dark-mode-button',
  );
  const unselectedButton = document.getElementById(
    theming === 'light' ? 'theming-dark-mode-button' : 'theming-light-mode-button',
  );
  if (selectedButton && unselectedButton) {
    selectedButton.classList.add('selected');
    unselectedButton.classList.remove('selected');
  }
  for (const themingVar of Object.keys(themings[theming])) {
    root.style.setProperty(themingVar, themings[theming][themingVar]);
  }
};

export const draw = async (mode?: 'include' | 'exclude') => {
  if (!editor) return;
  
  await editor.nextRender; // Ensure editor is ready
  
  const filter: string[] = [
    ...Object.entries(editor.model.interactive.elements)
      .filter(([, value]) => value)
      .map(([key]) => key),
    ...Object.entries(editor.model.interactive.relationships)
      .filter(([, value]) => value)
      .map(([key]) => key),
  ];

  const exportParam = mode
    ? { [mode]: filter, scale: editor.getScaleFactor() }
    : { scale: editor.getScaleFactor() };

  const { svg } = await editor.exportAsSVG(exportParam);
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  const svgBlobURL = URL.createObjectURL(svgBlob);

  const link = document.createElement('a');
  link.href = svgBlobURL;
  link.download = `Diagram.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(svgBlobURL);
};

export const setMode = async (mode) => {
  console.log("Setting mode to:", mode);
  if (!editor || !container) {
    console.error("Editor or container not initialized");
    return;
  }
  
  // Ensure container is actually a DOM element
  if (!(container instanceof HTMLElement)) {
    console.error("Container is not a valid HTML Element");
    return;
  }
  
  try {
    // Determine the correct mode value from Apollon.ApollonMode
    let apollonMode;
    if (mode === "modelling") {
      apollonMode = Apollon.ApollonMode.Modelling;
    } else if (mode === "assessment") {
      apollonMode = Apollon.ApollonMode.Assessment;
    } else if (mode === "exporting") {
      apollonMode = Apollon.ApollonMode.Exporting;
    } else {
      console.error("Unknown mode:", mode);
      return;
    }
    
    options = {
      ...options,
      mode: apollonMode
    };
    
    // Save current model before destroying editor
    const currentModel = editor.model;
    
    // Destroy and recreate the editor with new mode
    editor.destroy();
    options.model = currentModel;
    editor = new Apollon.ApollonEditor(container, options);
    await editor.nextRender;

    // Save the updated model with new mode
    await save();
    
    console.log("Mode successfully changed to:", apollonMode);
  } catch (error) {
    console.error("Error in setMode:", error);
    throw error;
  }
};

// Method to get the editor instance
export const getEditor = () => editor;

// Method that makes the editor available on the exports for direct access
export { editor };

// Method to get the next render promise
export const getNextRender = async () => {
  if (!editor) return Promise.reject("Editor not initialized");
  return editor.nextRender;
};

const render = async () => {
  await save();
  if (editor) {
    editor.destroy();
  }
  editor = new Apollon.ApollonEditor(container, options);
  await editor.nextRender; // Wait for initialization
};