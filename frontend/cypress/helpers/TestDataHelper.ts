/**
 * TEST DATA HELPER
 * Generador y manejo de datos de prueba
 */

export const TestDataHelper = {
  /**
   * Generar email aleatorio para pruebas
   */
  generateRandomEmail: (prefix = 'test') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}-${timestamp}-${random}@test.com`;
  },

  /**
   * Generar título de tarea aleatorio
   */
  generateRandomTaskTitle: (prefix = 'Task') => {
    const timestamp = Date.now();
    return `${prefix} ${timestamp}`;
  },

  /**
   * Obtener fecha futura en formato ISO
   */
  getFutureDate: (days = 7) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },

  /**
   * Obtener fecha pasada en formato ISO
   */
  getPastDate: (days = 7) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },

  /**
   * Crear datos de usuario válidos
   */
  createValidUser: (email?: string) => {
    return {
      email: email || this.generateRandomEmail(),
      password: 'StrongPassword123!',
      full_name: 'Test User',
    };
  },

  /**
   * Crear datos de tarea válida
   */
  createValidTask: () => {
    return {
      title: this.generateRandomTaskTitle(),
      description: 'This is a test task description',
      priority: 'medium',
      due_date: this.getFutureDate(7),
    };
  },

  /**
   * Crear datos de tarea inválida
   */
  createInvalidTask: (type: 'empty' | 'long' | 'missing') => {
    const tasks: { [key: string]: any } = {
      empty: {
        title: '',
        description: '',
      },
      long: {
        title: 'a'.repeat(500),
        description: 'Test',
      },
      missing: {
        description: 'Missing title',
      },
    };
    return tasks[type] || tasks.empty;
  },

  /**
   * Crear credenciales inválidas
   */
  createInvalidCredentials: (type: 'empty' | 'wrong' | 'nonexistent') => {
    const credentials: { [key: string]: any } = {
      empty: {
        email: '',
        password: '',
      },
      wrong: {
        email: 'admin@test.com',
        password: 'wrongpassword',
      },
      nonexistent: {
        email: 'nonexistent@test.com',
        password: 'password123',
      },
    };
    return credentials[type] || credentials.empty;
  },

  /**
   * Validar estructura de objeto
   */
  validateStructure: (obj: any, keys: string[]) => {
    keys.forEach((key) => {
      expect(obj).to.have.property(key);
    });
  },

  /**
   * Generar múltiples tareas
   */
  generateMultipleTasks: (count: number) => {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push({
        title: `Task ${i + 1} - ${Date.now()}`,
        description: `Description for task ${i + 1}`,
        priority: ['low', 'medium', 'high'][i % 3],
      });
    }
    return tasks;
  },
};
