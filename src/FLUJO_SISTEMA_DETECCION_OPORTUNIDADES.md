# 🔄 Flujo del Sistema de Detección de Oportunidades - Diagrama Visual

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SISTEMA DE DETECCIÓN DE OPORTUNIDADES              │
│                          SmartPet - FinancialManagement                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          1. RECOLECCIÓN DE DATOS                        │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
    │  VEHÍCULOS       │     │  CLIENTES        │     │  OPERACIONES     │
    │                  │     │                  │     │                  │
    │ • Sessions       │────▶│ • Total: 847     │────▶│ • Citas: 327     │
    │ • Ingresos       │     │ • Activos: 623   │     │ • KM: 5,130      │
    │ • Costos         │     │ • Nuevos: 42/mes │     │ • Horas: 304     │
    │ • Rentabilidad   │     │ • Crecimiento    │     │ • Capacidad      │
    └──────────────────┘     └──────────────────┘     └──────────────────┘
              │                       │                        │
              └───────────────────────┴────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    2. PROCESAMIENTO Y ANÁLISIS                          │
└─────────────────────────────────────────────────────────────────────────┘

    ╔═══════════════════════════════════════════════════════════════════╗
    ║         calculateOccupancyProjection()                            ║
    ╚═══════════════════════════════════════════════════════════════════╝
              │
              ├──┐ PASO 1: Calcular Ocupación Actual
              │  │
              │  │  Capacidad Total = Vehículos × 10 citas/día × 22 días
              │  │  = 2 × 10 × 22 = 440 citas/mes
              │  │
              │  │  Citas Completadas = 327
              │  │  Ocupación Actual = 327 / 440 = 74.3%
              │  │
              │◄─┘
              │
              ├──┐ PASO 2: Determinar Factor Estacional
              │  │
              │  │  Mes Actual: Diciembre
              │  │  ├─ Alta (Nov-Feb): Factor 1.25 ✓
              │  │  ├─ Media (Mar-Abr, Sep-Oct): Factor 1.0
              │  │  └─ Baja (May-Ago): Factor 0.85
              │  │
              │  │  Factor Estacional = 1.25
              │  │
              │◄─┘
              │
              ├──┐ PASO 3: Calcular Factor de Crecimiento
              │  │
              │  │  Tasa Crecimiento = 6.8% mensual = 0.068
              │  │  Factor Crecimiento = 1 + 0.068 = 1.068
              │  │  Factor 3 Meses = 1.068³ = 1.218
              │  │
              │◄─┘
              │
              ├──┐ PASO 4: Proyectar Ocupación
              │  │
              │  │  Proyección = Ocupación × Estacional × Crecimiento³
              │  │  = 74.3% × 1.25 × 1.218
              │  │  = 113.1%  🚨 SATURACIÓN DETECTADA
              │  │
              │◄─┘
              │
              ├──┐ PASO 5: Calcular Métricas Financieras
              │  │
              │  │  Ingreso Promedio/Vehículo = S/ 28,565
              │  │  Costos Promedio/Vehículo = S/ 16,890
              │  │  Utilidad Mensual = S/ 11,675
              │  │
              │  │  Inversión Nuevo Vehículo = S/ 75,000
              │  │  ROI = (11,675 × 12 / 75,000) × 100 = 37.8%
              │  │  Break-Even = 75,000 / 11,675 = 6.4 meses ≈ 7 meses
              │  │
              │◄─┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  3. SISTEMA DE DECISIÓN INTELIGENTE                     │
└─────────────────────────────────────────────────────────────────────────┘

                        ╔════════════════════╗
                        ║ Proyección > 85%?  ║
                        ╚════════════════════╝
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                   SÍ           NO           NO
              (113.1% > 85%)     │            │
                    │            │            │
                    │     ╔═══════════════╗   │
                    │     ║ Proyección    ║   │
                    │     ║    > 70%?     ║   │
                    │     ╚═══════════════╝   │
                    │            │            │
                    │           SÍ           NO
                    │            │            │
                    ▼            ▼            ▼
         ┌─────────────┐ ┌──────────┐ ┌─────────────┐
         │  🚀 EXPANDIR│ │⚡OPTIMIZAR│ │✅ MANTENER  │
         │             │ │           │ │             │
         │ ROI: 37.8%  │ │ Marketing │ │ Eficiencia  │
         │ B-E: 7 mes  │ │ Campañas  │ │ Rentabilid. │
         │ Rev: S/ 23K │ │ Promoción │ │ Reducir $   │
         └─────────────┘ └──────────┘ └─────────────┘
                    │            │            │
                    └────────────┴────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      4. GENERACIÓN DE REPORTE                           │
└─────────────────────────────────────────────────────────────────────────┘

                    ╔═══════════════════════════╗
                    ║  REPORTE DE RECOMENDACIÓN ║
                    ╚═══════════════════════════╝
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  ANÁLISIS       │ │  PROYECCIONES│ │  ACCIONES    │
    │  OCUPACIÓN      │ │  FINANCIERAS │ │  SUGERIDAS   │
    │                 │ │              │ │              │
    │ • Actual: 74.3% │ │ • ROI: 37.8% │ │ • Financiar  │
    │ • Proyec: 113%  │ │ • B-E: 7 mes │ │ • Contratar  │
    │ • Factor: 1.25  │ │ • Rev: S/ 23K│ │ • Equipar    │
    │ • Trend: 6.8%   │ │ • Util: S/11K│ │ • Capacitar  │
    └─────────────────┘ └──────────────┘ └──────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    5. VISUALIZACIÓN EN DASHBOARD                        │
└─────────────────────────────────────────────────────────────────────────┘

    ╔═════════════════════════════════════════════════════════════════╗
    ║                  GESTIÓN FINANCIERA - SMARTPET                  ║
    ╚═════════════════════════════════════════════════════════════════╝

    ┌─────────────────────────────────────────────────────────────────┐
    │  📊 KPIs PRINCIPALES                                            │
    ├─────────────────────────────────────────────────────────────────┤
    │  ROI: 37.8% │ ROA: 25.3% │ Margen: 22.1% │ Crecimiento: 8.7%  │
    └─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │  🚨 ALERTA DE OPORTUNIDAD DE EXPANSIÓN                          │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │  💡 Tu capacidad se proyecta al 113.1% en 3 meses              │
    │                                                                 │
    │  🚀 RECOMENDACIÓN: EXPANSIÓN INMEDIATA                          │
    │                                                                 │
    │  📊 ANÁLISIS DE NUEVO VEHÍCULO:                                 │
    │  • Inversión requerida: S/ 75,000                               │
    │  • ROI proyectado: 37.8% anual                                  │
    │  • Punto de equilibrio: 7 meses                                 │
    │  • Ingresos mensuales estimados: S/ 22,852                      │
    │  • Utilidad mensual estimada: S/ 11,675                         │
    │                                                                 │
    │  💡 Con 42 nuevos clientes/mes y crecimiento del 6.8%, un       │
    │     tercer vehículo se pagará en 7 meses y generará             │
    │     S/ 140,100 anuales adicionales.                             │
    │                                                                 │
    │  🎯 SIGUIENTE PASO: Asegurar financiamiento y comenzar          │
    │     búsqueda de tripulación.                                    │
    │                                                                 │
    │  [Ver Análisis Detallado] [Simular Escenarios]                 │
    └─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │  📈 ANÁLISIS DE CAPACIDAD Y OCUPACIÓN                           │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
    │  │ OCUPACIÓN    │  │ PROYECCIÓN   │  │ CRECIMIENTO  │         │
    │  │ ACTUAL       │  │ 3 MESES      │  │ MENSUAL      │         │
    │  │              │  │              │  │              │         │
    │  │   74.3%      │  │   113.1%     │  │    6.8%      │         │
    │  │ ████████░░   │  │ ████████████ │  │ ███░░░░░░░   │         │
    │  └──────────────┘  └──────────────┘  └──────────────┘         │
    │                                                                 │
    │  🔥 TEMPORADA ALTA (Diciembre)                                  │
    │  Factor estacional: 125% - Aprovecha para maximizar ingresos   │
    └─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │  💰 ANÁLISIS FINANCIERO: NUEVO VEHÍCULO                         │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │
    │  │ ROI    │  │ B-EVEN │  │INGRESOS│  │INVERSIÓ│               │
    │  │ ANUAL  │  │        │  │  /MES  │  │   N    │               │
    │  │        │  │        │  │        │  │        │               │
    │  │ 37.8%  │  │7 meses │  │S/ 23K  │  │ S/ 75K │               │
    │  └────────┘  └────────┘  └────────┘  └────────┘               │
    │                                                                 │
    │  ✅ Momento Óptimo para Expansión                               │
    │     Tu ocupación proyectada (113%) indica saturación           │
    │                                                                 │
    │  ✅ Alta Rentabilidad Proyectada                                │
    │     ROI de 37.8% superior al promedio del sector (15-20%)     │
    │                                                                 │
    │  ✅ Recuperación Rápida                                         │
    │     Inversión se recupera en 7 meses (< 12 recomendado)       │
    │                                                                 │
    │  [Solicitar Financiamiento] [Simular Escenarios]               │
    └─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │  📊 PROYECCIÓN DE INGRESOS (PRÓXIMOS 6 MESES)                   │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐                     │
    │  │+1 │  │+2 │  │+3 │  │+4 │  │+5 │  │+6 │                     │
    │  │   │  │   │  │   │  │   │  │   │  │   │                     │
    │  │58K│  │60K│  │61K│  │56K│  │53K│  │54K│                     │
    │  │+6%│  │+8%│  │+10%│ │+5%│  │+2%│  │+3%│                     │
    │  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘                     │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Actualización de Datos

```
┌────────────────────────────────────────────────────────────────┐
│                   CICLO DE ACTUALIZACIÓN                       │
└────────────────────────────────────────────────────────────────┘

    Tiempo Real ◄─────────────────────────────────────────┐
         │                                                 │
         ▼                                                 │
    ┌─────────────┐                                        │
    │  EVENTOS    │                                        │
    │  DEL SISTEMA│                                        │
    └─────────────┘                                        │
         │                                                 │
         ├──► Nueva Cita Completada ──────────────────────┤
         │                                                 │
         ├──► Cierre de Caja ─────────────────────────────┤
         │                                                 │
         ├──► Nuevo Cliente Registrado ───────────────────┤
         │                                                 │
         ├──► Gasto Operativo Registrado ─────────────────┤
         │                                                 │
         └──► Fin de Mes ─────────────────────────────────┤
                                                           │
    Automático ◄──────────────────────────────────────────┘
         │
         ▼
    ┌─────────────┐
    │ RECALCULAR  │
    │ PROYECCIONES│
    └─────────────┘
         │
         ▼
    ┌─────────────┐
    │ ACTUALIZAR  │
    │ DASHBOARD   │
    └─────────────┘
         │
         ▼
    ┌─────────────┐
    │  ENVIAR     │
    │ ALERTAS (SI │
    │ NECESARIO)  │
    └─────────────┘
```

---

## 🎯 Árbol de Decisión Visual

```
                        ┌─────────────────────┐
                        │ INICIO: Analizar    │
                        │ Oportunidad de      │
                        │ Expansión           │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │ Calcular Ocupación  │
                        │ Actual y Proyectada │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
         ┌─────────────────────┐      ┌─────────────────────┐
         │ Proyección > 85%    │      │ Proyección ≤ 85%    │
         │ (Alta Saturación)   │      │ (Capacidad Normal)  │
         └──────────┬──────────┘      └──────────┬──────────┘
                    │                             │
                    ▼                             │
         ┌─────────────────────┐                  │
         │ Calcular ROI y      │                  │
         │ Break-Even          │                  │
         └──────────┬──────────┘                  │
                    │                             │
         ┌──────────┴──────────┐                  │
         │                     │                  │
         ▼                     ▼                  ▼
┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│ ROI > 30%    │    │ ROI 20-30%   │    │ Proyección     │
│ B-E < 8 mes  │    │ B-E 8-12 mes │    │ 70-85%         │
└──────┬───────┘    └──────┬───────┘    └────────┬───────┘
       │                   │                      │
       ▼                   ▼                      ▼
┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│ 🚀 EXPANDIR  │    │ 🚀 EXPANDIR  │    │ ⚡ OPTIMIZAR   │
│ INMEDIATAMENTE│   │ CON CAUTELA  │    │ OPERACIONES    │
│              │    │              │    │                │
│ • Financiar  │    │ • Evaluar    │    │ • Marketing    │
│ • Contratar  │    │ • Preparar   │    │ • Eficiencia   │
│ • Equipar    │    │ • Planificar │    │ • Retención    │
└──────────────┘    └──────────────┘    └────────┬───────┘
                                                  │
                                                  ▼
                                        ┌────────────────┐
                                        │ Proyección     │
                                        │ < 70%          │
                                        └────────┬───────┘
                                                 │
                                                 ▼
                                        ┌────────────────┐
                                        │ ✅ MANTENER    │
                                        │ OPERACIÓN      │
                                        │                │
                                        │ • Eficiencia   │
                                        │ • Rentabilidad │
                                        │ • Reducir $    │
                                        └────────────────┘
```

---

## 📊 Matriz de Decisión

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE DECISIÓN                               │
│                   Sistema de Detección de Oportunidades                 │
└─────────────────────────────────────────────────────────────────────────┘

OCUPACIÓN PROYECTADA
    ▲
100%├─────────┬──────────────────────────────────────────────────────────
    │         │          🚀 ZONA DE EXPANSIÓN                            
 95%├─────────┤          (Saturación Alta)                               
    │         │          • ROI > 30%: Expandir inmediatamente           
 90%├─────────┤          • ROI 20-30%: Expandir con cautela             
    │         │          • ROI < 20%: Revisar costos                    
 85%├─────────┼──────────────────────────────────────────────────────────
    │         │          ⚡ ZONA DE OPTIMIZACIÓN                         
 80%├─────────┤          (Capacidad Alta)                                
    │         │          • Mejorar marketing                            
 75%├─────────┤          • Optimizar rutas                               
    │         │          • Campañas promocionales                        
 70%├─────────┼──────────────────────────────────────────────────────────
    │         │          ✅ ZONA DE MANTENIMIENTO                        
 65%├─────────┤          (Capacidad Moderada)                            
    │         │          • Aumentar frecuencia clientes                  
 60%├─────────┤          • Eficiencia operativa                          
    │         │          • Reducir costos                                
 55%├─────────┤                                                           
    │         │                                                           
 50%├─────────┼──────────────────────────────────────────────────────────
    │         │          ⚠️ ZONA DE PREOCUPACIÓN                         
 45%├─────────┤          (Capacidad Baja)                                 
    │         │          • Revisar estrategia comercial                  
 40%├─────────┤          • Reducir costos fijos                          
    │         │          • Considerar retirar vehículo                   
    └─────────┴──────────────────────────────────────────────────────────
             0%       10%      20%      30%      40%      50%
                            ROI PROYECTADO
```

---

## 🚦 Semáforo de Decisión

```
┌─────────────────────────────────────────────────────────────────────┐
│              SEMÁFORO DE DECISIÓN DE EXPANSIÓN                      │
└─────────────────────────────────────────────────────────────────────┘

    ╔═══════════════════════════════════════════════════════════════╗
    ║                      🟢 VERDE - EXPANDIR                      ║
    ╚═══════════════════════════════════════════════════════════════╝
    
    Condiciones:
    ✓ Ocupación proyectada > 85%
    ✓ ROI proyectado > 30%
    ✓ Break-even < 8 meses
    ✓ Crecimiento sostenido > 5% mensual
    ✓ Temporada favorable
    
    Acción: 🚀 Proceder con expansión inmediatamente


    ╔═══════════════════════════════════════════════════════════════╗
    ║                    🟡 AMARILLO - OPTIMIZAR                    ║
    ╚═══════════════════════════════════════════════════════════════╝
    
    Condiciones:
    ⚠ Ocupación proyectada 70-85%
    ⚠ ROI proyectado 20-30%
    ⚠ Break-even 8-12 meses
    ⚠ Crecimiento moderado 3-5% mensual
    
    Acción: ⚡ Optimizar antes de expandir


    ╔═══════════════════════════════════════════════════════════════╗
    ║                     🔴 ROJO - MANTENER                        ║
    ╚═══════════════════════════════════════════════════════════════╝
    
    Condiciones:
    ✗ Ocupación proyectada < 70%
    ✗ ROI proyectado < 20%
    ✗ Break-even > 12 meses
    ✗ Crecimiento bajo < 3% mensual
    
    Acción: ✅ Enfocarse en eficiencia actual
```

---

## 🔄 Integración con Otros Módulos

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ECOSISTEMA SMARTPET INTEGRADO                      │
└─────────────────────────────────────────────────────────────────────┘

    ┌───────────────────────────────────────────────────────────────┐
    │                     GESTIÓN FINANCIERA                        │
    │              (Sistema de Detección de Oportunidades)          │
    └─────────────────┬────────────────────────┬───────────────────┘
                      │                        │
          ┌───────────┴───────┐       ┌────────┴──────────┐
          │                   │       │                   │
          ▼                   ▼       ▼                   ▼
    ┌──────────┐      ┌──────────┐ ┌──────────┐  ┌──────────┐
    │   CAJA   │◄────►│  CITAS   │ │VEHÍCULOS │◄─┤ CLIENTES │
    │ REGISTER │      │APPOINTME.│ │ VEHICLES │  │ CLIENTS  │
    └────┬─────┘      └────┬─────┘ └────┬─────┘  └────┬─────┘
         │                 │            │             │
         │ Datos:          │ Datos:     │ Datos:      │ Datos:
         │ • Ingresos      │ • Citas    │ • Costos    │ • Total
         │ • Gastos        │ • Ocupación│ • KM        │ • Activos
         │ • Utilidades    │ • Duración │ • Manten.   │ • Nuevos
         │                 │            │             │ • Crecim.
         │                 │            │             │
         └─────────────────┴────────────┴─────────────┘
                           │
                           ▼
         ┌────────────────────────────────────────────────┐
         │          ANÁLISIS PREDICTIVO                   │
         │  • Ocupación actual y proyectada               │
         │  • ROI de nuevo vehículo                       │
         │  • Punto de equilibrio                         │
         │  • Factor estacional                           │
         │  • Tendencia de crecimiento                    │
         └────────────────┬───────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────────────┐
         │        RECOMENDACIONES AUTOMÁTICAS             │
         │  → Expandir / Optimizar / Mantener             │
         │  → Alertas y notificaciones                    │
         │  → Próximos pasos accionables                  │
         └────────────────────────────────────────────────┘
```

---

## 📈 Timeline de Expansión Recomendado

```
┌─────────────────────────────────────────────────────────────────────┐
│              TIMELINE DE EXPANSIÓN (7 MESES)                        │
└─────────────────────────────────────────────────────────────────────┘

MES 1-2: PREPARACIÓN Y FINANCIAMIENTO
├─ Semana 1-2: Análisis final y validación de números
├─ Semana 3-4: Solicitud y aprobación de financiamiento
├─ Semana 5-6: Selección y compra de vehículo
└─ Semana 7-8: Equipamiento del vehículo (grooming setup)

MES 3-4: CONTRATACIÓN Y CAPACITACIÓN
├─ Semana 9-10: Reclutamiento de groomer y asistente
├─ Semana 11-12: Capacitación técnica (servicios)
├─ Semana 13-14: Capacitación operativa (sistema, rutas)
└─ Semana 15-16: Pruebas piloto con clientes actuales

MES 5-6: LANZAMIENTO Y RAMP-UP
├─ Semana 17-18: Lanzamiento oficial (80% capacidad)
├─ Semana 19-20: Ajustes operativos
├─ Semana 21-22: Expansión de zonas de cobertura
└─ Semana 23-24: Optimización de rutas

MES 7: BREAK-EVEN Y EVALUACIÓN
├─ Semana 25-26: Alcance de punto de equilibrio ✓
├─ Semana 27-28: Análisis de resultados vs proyección
└─ Evaluación de siguiente expansión

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLUJO DE CAJA PROYECTADO:

Mes 1:  -S/ 75,000  (Inversión inicial)
Mes 2:  -S/ 15,000  (Equipamiento + Contratación)
Mes 3:  -S/  8,000  (Capacitación + Pruebas)
Mes 4:  +S/  5,000  (Primeros ingresos - costos operativos)
Mes 5:  +S/ 12,000  (Ramp-up a 60%)
Mes 6:  +S/ 18,000  (Operación al 80%)
Mes 7:  +S/ 23,000  (Operación normal) ◄─── BREAK-EVEN ✓

TOTAL:  -S/ 40,000  (Inversión neta recuperada en 7 meses)

A partir del Mes 8: Flujo positivo sostenido de S/ 11,675/mes
```

---

**Fecha:** 19 de Diciembre, 2024  
**Sistema:** SmartPet - Diagrama de Flujo de Detección de Oportunidades  
**Módulo:** `FinancialManagement.tsx`
