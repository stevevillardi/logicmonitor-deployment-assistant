// swagger-ui.d.ts
declare module 'swagger-ui-dist/swagger-ui-bundle' {
    interface SwaggerUIOptions {
      url?: string;
      urls?: Array<{ url: string; name: string }>;
      spec?: any;
      dom_id?: string;
      domNode?: HTMLElement;
      validatorUrl?: string | null;
      presets?: Array<any>;
      plugins?: Array<any>;
      layout?: string;
      docExpansion?: 'list' | 'full' | 'none';
      defaultModelsExpandDepth?: number;
      displayOperationId?: boolean;
      filter?: boolean | string | undefined;
      deepLinking?: boolean;
      showExtensions?: boolean;
      showCommonExtensions?: boolean;
      tryItOutEnabled?: boolean;
      requestInterceptor?: (req: any) => any;
      responseInterceptor?: (res: any) => any;
      syntaxHighlight?: {
        activate?: boolean;
        theme?: string;
      };
      [key: string]: any;
    }
  
    interface SwaggerUIBundle {
      (options: SwaggerUIOptions): {
        getSystem: () => {
          specActions: {
            updateUrl: (url: string) => void;
          };
        };
      };
      presets: {
        apis: any;
      };
      plugins: {
        DownloadUrl: any;
      };
    }
  
    const SwaggerUIBundle: SwaggerUIBundle;
    export default SwaggerUIBundle;
  }
  
  declare module 'swagger-ui-dist/swagger-ui-standalone-preset' {
    const SwaggerUIStandalonePreset: {
      default: any;
    };
    export default SwaggerUIStandalonePreset;
  }
  
  declare module 'swagger-ui-dist/swagger-ui.css' {
    const content: any;
    export default content;
  }