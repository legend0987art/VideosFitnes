
import { GoogleGenAI, Type } from "@google/genai";
import { BiomechSyncData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Motor de Sincronización Biomecánica v3.9 - Blender Export Edition
 * Genera especificaciones técnicas de Rigging para exportación a formato FBX/Blender.
 */
export const runBiomechSyncV3 = async (
  charInput: { image?: string; text?: string },
  refInput: { image?: string; text?: string },
  exercise: string
): Promise<{ data: BiomechSyncData; sources: { title: string; uri: string }[] }> => {
  
  const prompt = `ACTÚA COMO UN INGENIERO DE PROMPTS DE VIDEO Y EXPERTO EN BIOMECÁNICA.
  
  TU MISIÓN: Analizar la imagen de referencia donde una persona realiza el ejercicio "${exercise}" en una máquina. Debes extraer la mecánica de la máquina, los puntos de contacto y la pose para crear un análisis biomecánico completo y un PROMPT DE VIDEO EN INGLÉS altamente descriptivo.

  BASE DE CONOCIMIENTO BIOMECÁNICO (JSON DE REFERENCIA ESTRICTA):
  {
    "Sentadilla Hack / Hack Squat": {
      "estatico": "Bottom metal footplate, main frame, 45-degree rails. They NEVER move or bend.",
      "dinamico": "Padded sled, shoulder pads, backrest. They slide linearly up and down the rails.",
      "anclajes": "Feet GLUED to bottom footplate. Back and shoulders GLUED to the moving sled. Hands GLUED to sled handles.",
      "accion": "Bends knees to lower the sled, pushes through feet to extend legs and drive sled up."
    },
    "Prensa de Piernas / Leg Press": {
      "estatico": "Seat, backrest, main frame. They NEVER move.",
      "dinamico": "Top metal footplate and weight carriage. They slide diagonally.",
      "anclajes": "Back and glutes GLUED to the stationary seat. Feet GLUED to the moving footplate.",
      "accion": "Bends knees to lower the footplate towards chest, pushes through feet to extend legs and drive footplate away."
    },
    "Jalón al Pecho / Lat Pulldown": {
      "estatico": "Seat, knee pads, main frame, weight stack frame. They NEVER move.",
      "dinamico": "Top cable and wide grip bar. They move up and down.",
      "anclajes": "Glutes GLUED to seat. Knees GLUED under knee pads. Hands GLUED to the wide bar.",
      "accion": "Pulls the bar down to the upper chest by driving elbows down, then slowly releases the bar back up."
    }
  }

  REGLAS UNIVERSALES PARA EL PROMPT DE VIDEO (video_prompt_en):
  1. IDIOMA Y CÁMARA: DEBE ESTAR EN INGLÉS. Empieza siempre con "STATIC CAMERA. The camera does not move."
  2. CONSULTA EL JSON: Si el ejercicio coincide con uno de la BASE DE CONOCIMIENTO, usa EXACTAMENTE esas reglas de qué se mueve y qué no. Si no está, dedúcelo lógicamente.
  3. ENTORNO ESTÁTICO: Especifica que las partes estáticas están "bolted to the floor", son de metal sólido/rígido, y NO se doblan ni deforman.
  4. ANCLAJES: Especifica que las partes del cuerpo están "locked and glued" a sus soportes y NO resbalan.
  5. ACCIÓN: Describe la acción paso a paso de forma visual.
  6. FORMATO BASE: Cinematic, photorealistic 3D animation of a silver muscular mannequin...

  INPUTS:
  - Sujeto Objetivo: ${charInput.text || 'Basado en imagen'}
  - Referencia (Persona en Máquina): ${refInput.text || 'Basado en la imagen de referencia'}
  - Ejercicio: ${exercise}

  RETORNA UN JSON ESTRICTO CON EL ANÁLISIS Y EL PROMPT DE VIDEO.`;

  const contents: any[] = [{ text: prompt }];
  
  if (charInput.image) {
    contents.push({ inlineData: { data: charInput.image.split(',')[1], mimeType: 'image/jpeg' } });
  }
  if (refInput.image) {
    contents.push({ inlineData: { data: refInput.image.split(',')[1], mimeType: 'image/jpeg' } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: contents },
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verificacion_grounding: {
            type: Type.OBJECT,
            properties: {
              maquina_identificada: { type: Type.STRING },
              ejercicio_solicitado: { type: Type.STRING },
              validacion_biomecanica: { type: Type.STRING }
            },
            required: ['maquina_identificada', 'ejercicio_solicitado', 'validacion_biomecanica']
          },
          analisis_sujeto_maquina: {
            type: Type.OBJECT,
            properties: {
              alineacion_requerida: { type: Type.STRING },
              puntos_contacto_ik: {
                type: Type.OBJECT,
                properties: {
                  pecho: { type: Type.STRING },
                  caderas: { type: Type.STRING },
                  pies: { type: Type.STRING },
                  manos: { type: Type.STRING }
                },
                required: ['pecho', 'caderas', 'pies', 'manos']
              }
            },
            required: ['alineacion_requerida', 'puntos_contacto_ik']
          },
          mapeo_dinamico: {
            type: Type.OBJECT,
            properties: {
              trayectoria_arco: { type: Type.STRING },
              relacion_rodillo_extremidad: { type: Type.STRING },
              centro_rotacion_mecanico: { type: Type.STRING },
              perfil_timing: { type: Type.STRING }
            },
            required: ['trayectoria_arco', 'relacion_rodillo_extremidad', 'centro_rotacion_mecanico', 'perfil_timing']
          },
          logica_movimiento: {
            type: Type.OBJECT,
            properties: {
              fases: {
                type: Type.OBJECT,
                properties: {
                  concentrica: {
                    type: Type.OBJECT,
                    properties: {
                      accion: { type: Type.STRING },
                      rango_movimiento_grados: { type: Type.STRING },
                      respiracion: { type: Type.STRING }
                    },
                    required: ['accion', 'rango_movimiento_grados', 'respiracion']
                  },
                  excentrica: {
                    type: Type.OBJECT,
                    properties: {
                      accion: { type: Type.STRING },
                      rango_movimiento_grados: { type: Type.STRING },
                      respiracion: { type: Type.STRING }
                    },
                    required: ['accion', 'rango_movimiento_grados', 'respiracion']
                  }
                },
                required: ['concentrica', 'excentrica']
              },
              eficiencia_profesional: { type: Type.STRING }
            },
            required: ['fases', 'eficiencia_profesional']
          },
          output_rig_blender: {
            type: Type.OBJECT,
            properties: {
              nombre_animacion: { type: Type.STRING },
              fps: { type: Type.NUMBER },
              bindings: {
                type: Type.OBJECT,
                properties: {
                  chest_pad_constraint: { type: Type.STRING },
                  hip_pivot_lock: { type: Type.STRING },
                  feet_roller_ik: { type: Type.STRING },
                  hands_handle_target: { type: Type.STRING }
                },
                required: ['chest_pad_constraint', 'hip_pivot_lock', 'feet_roller_ik', 'hands_handle_target']
              },
              notas_seguridad: { type: Type.STRING }
            },
            required: ['nombre_animacion', 'fps', 'bindings', 'notas_seguridad']
          },
          video_prompt_en: { 
            type: Type.STRING,
            description: "A highly descriptive, visual English prompt for a video generation model. Must explicitly state which parts of the machine move and which are stationary."
          }
        },
        required: ['verificacion_grounding', 'analisis_sujeto_maquina', 'mapeo_dinamico', 'logica_movimiento', 'output_rig_blender', 'video_prompt_en']
      }
    }
  });

  const sources: { title: string; uri: string }[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
    if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
  });

  return { data: JSON.parse(response.text), sources };
};

export const generateVisualV3 = async (
  sync: BiomechSyncData, 
  refImageBase64?: string,
  charImageBase64?: string,
  charDesc?: string
): Promise<string> => {
  const prompt = `IMAGE EDITING SPECIFICATION:
  
  You are an expert AI image editor. I am providing two images:
  1. The base image (first image): A person performing an exercise on a gym machine.
  2. The subject reference (second image): The person/character that should be placed into the machine.
  
  YOUR TASK: 
  Recreate the first image (the base image) exactly, keeping the pose identical. However, REPLACE the person currently on the machine with a highly specific target subject.
  
  CRITICAL INSTRUCTION REGARDING THE POSE AND MACHINE:
  You MUST PRESERVE the exact pose of the person in the base image. 
  - If the person has their hands raised to hold shoulder pads or handles, the new subject MUST have their hands raised holding those exact same pads/handles.
  - DO NOT change the position of the arms or legs. DO NOT put the arms down by the sides if they are raised in the original image.
  - If the person's feet are on a specific platform, the new subject's feet MUST be on that exact platform.
  - You MUST PRESERVE the gym machine from the first image. The machine MUST be clearly visible, fully rendered, and the new subject MUST be interacting with it exactly as the original person was.
  
  BIOMECHANICAL CONTACT POINTS TO ENFORCE:
  - Hands: ${sync.analisis_sujeto_maquina.puntos_contacto_ik.manos}
  - Feet: ${sync.analisis_sujeto_maquina.puntos_contacto_ik.pies}
  - Chest/Back/Shoulders: ${sync.analisis_sujeto_maquina.puntos_contacto_ik.pecho}
  - Hips: ${sync.analisis_sujeto_maquina.puntos_contacto_ik.caderas}
  
  TARGET SUBJECT DESCRIPTION: A highly muscular, COMPLETELY FACELESS, hairless, ultra-glossy silver/chrome mannequin. It must look exactly like a premium 3D anatomical model made of highly reflective liquid silver or chrome. It has NO facial features (smooth head), NO hair, but extremely defined and deep muscular cuts. ${charDesc ? `Additional details: ${charDesc}` : ''}
  
  ENVIRONMENT STYLE:
  The environment should look like a premium, modern, dark, clean, professional gym setting with cinematic studio lighting that reflects off the silver mannequin. The machine itself should look premium and well-made.
  
  REQUIREMENTS:
  1. The new subject MUST be in the exact same pose as the person in the base image, performing the exercise ON THE MACHINE.
  2. The GYM MACHINE from the base image MUST be present and clearly visible.
  3. The final image MUST be a high-fidelity, photorealistic 3D render. 
  4. CRITICAL: The subject MUST be a glossy, highly reflective chrome/silver muscular mannequin with ZERO facial features and ZERO hair.`;

  const contents: any[] = [];

  if (refImageBase64) {
    contents.push({ inlineData: { data: refImageBase64.split(',')[1], mimeType: 'image/jpeg' } });
  }
  if (charImageBase64) {
    contents.push({ inlineData: { data: charImageBase64.split(',')[1], mimeType: 'image/jpeg' } });
  }
  
  contents.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: contents },
    config: {}
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Visual generation failed.");
};

export const generateVideo = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-lite-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed: No URI returned.");
  }

  const apiKey = process.env.API_KEY || '';
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
