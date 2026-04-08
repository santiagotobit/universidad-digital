/**
 * VALIDATION HELPER
 * Utilidades para validaciones comunes en pruebas
 */

export const ValidationHelper = {
  /**
   * Validar estructura de respuesta de login
   */
  validateLoginResponse: (response: any) => {
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('access_token');
    expect(response.body.access_token).to.be.a('string');
    expect(response.body.access_token).to.not.be.empty;
  },

  /**
   * Validar estructura de usuario
   */
  validateUserResponse: (response: any) => {
    expect(response.status).to.equal(200);
    const user = response.body;
    expect(user).to.have.property('id');
    expect(user).to.have.property('email');
    expect(user).to.have.property('full_name');
    expect(user).to.have.property('is_active');
    expect(user).to.have.property('created_at');
    expect(user).to.have.property('roles');
    expect(user.roles).to.be.an('array');
  },

  /**
   * Validar estructura de tarea
   */
  validateTaskResponse: (response: any) => {
    expect(response.status).to.be.oneOf([200, 201]);
    const task = response.body;
    expect(task).to.have.property('id');
    expect(task).to.have.property('title');
    expect(task).to.have.property('description');
    expect(task).to.have.property('status');
    expect(task).to.have.property('created_at');
  },

  /**
   * Validar que respuesta tiene error
   */
  validateErrorResponse: (response: any, expectedStatus: number) => {
    expect(response.status).to.equal(expectedStatus);
    expect(response.body).to.have.property('detail');
  },

  /**
   * Validar que respuesta es válida JSON
   */
  validateJsonStructure: (data: any, expectedKeys: string[]) => {
    expectedKeys.forEach((key) => {
      expect(data).to.have.property(key);
    });
  },

  /**
   * Validar tipos de datos
   */
  validateDataTypes: (
    data: any,
    schema: {
      [key: string]: string;
    }
  ) => {
    Object.entries(schema).forEach(([key, type]) => {
      expect(data[key]).to.exist;
      if (type === 'string') {
        expect(data[key]).to.be.a('string');
      } else if (type === 'number') {
        expect(data[key]).to.be.a('number');
      } else if (type === 'boolean') {
        expect(data[key]).to.be.a('boolean');
      } else if (type === 'array') {
        expect(data[key]).to.be.an('array');
      } else if (type === 'object') {
        expect(data[key]).to.be.an('object');
      }
    });
  },

  /**
   * Validar que credenciales son inválidas
   */
  validateInvalidCredentialsError: (response: any) => {
    expect(response.status).to.equal(401);
    expect(response.body.detail).to.include('Invalid');
  },

  /**
   * Validar que validación falla con los campos correctos
   */
  validateValidationError: (response: any, expectedFields: string[]) => {
    expect(response.status).to.equal(422);
    const errors = response.body.detail;
    expect(errors).to.be.an('array');
    const errorFields = errors.map((e: any) => e.loc[1]);
    expectedFields.forEach((field) => {
      expect(errorFields).to.include(field);
    });
  },

  /**
   * Validar lista de items
   */
  validateListResponse: (response: any) => {
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
  },

  /**
   * Validar status de respuesta
   */
  validateStatusCode: (response: any, expectedStatus: number) => {
    expect(response.status).to.equal(expectedStatus);
  },

  /**
   * Validar tiempo de respuesta
   */
  validateResponseTime: (response: any, maxTime: number) => {
    expect(response.duration).to.be.lessThan(maxTime);
  },
};
