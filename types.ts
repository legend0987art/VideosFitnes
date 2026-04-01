
export interface CharacterParameters {
  physique: string;
  height_estimate_cm: number;
  body_type: string;
  major_joints_detected: string[];
}

export interface MachineParameters {
  name: string;
  brand: string;
  mechanical_behavior: string;
  detected_features: string[];
}

export interface BiomechSyncData {
  verificacion_grounding: {
    maquina_identificada: string;
    ejercicio_solicitado: string;
    validacion_biomecanica: string;
  };
  analisis_sujeto_maquina: {
    alineacion_requerida: string;
    puntos_contacto_ik: {
      pecho: string;
      caderas: string;
      pies: string;
      manos: string;
    };
  };
  mapeo_dinamico: {
    trayectoria_arco: string; // Descripción de la curva (ej: "Arco de 90 grados centrado en pivote X")
    relacion_rodillo_extremidad: string; // Cómo interactúa la carga con el cuerpo
    centro_rotacion_mecanico: string; // Coordenada o descripción del pivote
    perfil_timing: string; // Aceleración, velocidad constante, frenado
  };
  logica_movimiento: {
    fases: {
      concentrica: {
        accion: string;
        rango_movimiento_grados: string;
        respiracion: string;
      };
      excentrica: {
        accion: string;
        rango_movimiento_grados: string;
        respiracion: string;
      };
    };
    eficiencia_profesional: string;
  };
  output_rig_blender: {
    nombre_animacion: string;
    fps: number;
    bindings: {
      chest_pad_constraint: string;
      hip_pivot_lock: string;
      feet_roller_ik: string;
      hands_handle_target: string;
    };
    notas_seguridad: string;
  };
  video_prompt_en: string;
}

export interface AnalysisState {
  syncData: BiomechSyncData | null;
  groundingSources: { title: string; uri: string }[];
  visualUrl: string | null;
  videoUrl: string | null;
  videoPrompt: string;
  isAnalyzing: boolean;
  isVideoGenerating: boolean;
}
