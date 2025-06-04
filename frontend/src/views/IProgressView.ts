/**
 * IProgressView интерфейс для UI-слоя, показывающего прогресс-бар
 */
 export interface IProgressView {
    /** show показать контейнер с прогресс-баром */
    show(): void;
  
    /** hide скрыть контейнер с прогресс-баром */
    hide(): void;
  
    /**
     * setPercent обновить ширину полосы прогресса
     * @param pct - процент (0–100)
     */
    setPercent(pct: number): void;
  }
  