import { docs_v1, docs } from '@googleapis/docs';
import { drive_v3, drive } from '@googleapis/drive';
import { JWT } from 'google-auth-library';

export interface DocumentContent {
  type: 'paragraph' | 'table' | 'image' | 'heading' | 'bulletList' | 'numberedList';
  content: any;
  style?: any;
  imageOptions?: {
    width?: number;
    height?: number;
  };
}

export class GoogleDocsService {
  private auth: JWT;
  private docs: docs_v1.Docs;
  private drive: drive_v3.Drive;

  constructor(credentials: {
    client_email: string;
    private_key: string;
    project_id: string;
  }) {
    this.auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });

    this.docs = docs({
      version: 'v1',
      auth: this.auth
    });
    this.drive = drive({
      version: 'v3',
      auth: this.auth
    });
  }

  async createOrUpdateDocument(
    title: string, 
    contents: DocumentContent[], 
    userEmail: string,
    existingDocId?: string
  ) {
    try {
      let documentId: string;
      let currentEndIndex = 1;

      if (existingDocId) {
        documentId = existingDocId;
        
        // Get current document to find its length
        const document = await this.docs.documents.get({
          documentId: existingDocId
        });
        
        if (document.data.body?.content) {
          const lastContent = document.data.body.content[document.data.body.content.length - 1];
          currentEndIndex = lastContent.endIndex || 1;
          
          // Clear the document, but avoid the final newline
          if (currentEndIndex > 1) {
            await this.docs.documents.batchUpdate({
              documentId,
              requestBody: {
                requests: [{
                  deleteContentRange: {
                    range: {
                      startIndex: 1,
                      endIndex: Math.max(1, currentEndIndex - 1) // Subtract 1 to avoid the newline
                    }
                  }
                }]
              }
            });
            currentEndIndex = 1; // Reset after clearing
          }
        }
      } else {
        // Create new document
        const document = await this.docs.documents.create({
          requestBody: { title },
        });
        documentId = document.data.documentId!;

        // Share with user and transfer ownership
        await this.drive.permissions.create({
          fileId: documentId,
          transferOwnership: true,
          requestBody: {
            type: 'user',
            role: 'owner',
            emailAddress: userEmail
          },
          supportsAllDrives: true
        });

        // Wait a moment for ownership transfer to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Process each content item sequentially
      for (const content of contents) {
        const requests = this.createContentRequest(content, currentEndIndex);
        if (requests.length > 0) {
          await this.docs.documents.batchUpdate({
            documentId,
            requestBody: { requests },
          });
          
          // Update currentEndIndex based on content type and actual content
          switch (content.type) {
            case 'bulletList':
            case 'numberedList':
              const items = Array.isArray(content.content) ? content.content : [content.content];
              currentEndIndex += items.reduce((acc, item) => acc + item.length + 1, 0);
              break;
            case 'image':
              currentEndIndex += 2; // Account for image (1) and newline (1)
              break;
            default:
              currentEndIndex += content.content.length + 1;
          }
        }
      }

      return {
        documentId,
        title,
        url: `https://docs.google.com/document/d/${documentId}/edit`,
      };
    } catch (error) {
      console.error('Error with Google Doc:', error);
      throw error;
    }
  }

  private createContentRequest(content: DocumentContent, startIndex: number): docs_v1.Schema$Request[] {
    switch (content.type) {
      case 'paragraph':
        return [{
          insertText: {
            location: { index: startIndex },
            text: content.content + '\n'
          }
        }, {
          updateParagraphStyle: {
            range: {
              startIndex: startIndex,
              endIndex: startIndex + content.content.length
            },
            paragraphStyle: {
              namedStyleType: 'NORMAL_TEXT'
            },
            fields: 'namedStyleType'
          }
        }];

      case 'heading':
        return [{
          insertText: {
            location: { index: startIndex },
            text: content.content + '\n'
          }
        }, {
          updateParagraphStyle: {
            range: {
              startIndex: startIndex,
              endIndex: startIndex + content.content.length
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_1'
            },
            fields: 'namedStyleType'
          }
        }];

      case 'table':
        // Skip tables for now
        return [];

      case 'bulletList':
      case 'numberedList': {
        const items = Array.isArray(content.content) ? content.content : [content.content];
        const requests: docs_v1.Schema$Request[] = [];
        let currentIndex = startIndex;

        // Insert all text first
        items.forEach(item => {
          requests.push({
            insertText: {
              location: { index: currentIndex },
              text: item + '\n'
            }
          });
          currentIndex += item.length + 1;
        });

        // Then apply bullets/numbering to all items at once
        requests.push({
          createParagraphBullets: {
            range: {
              startIndex: startIndex,
              endIndex: currentIndex - 1  // Subtract 1 to exclude final newline
            },
            bulletPreset: content.type === 'bulletList' ? 
              'BULLET_DISC_CIRCLE_SQUARE' : 
              'NUMBERED_DECIMAL_NESTED'
          }
        });

        return requests;
      }

      case 'image':
        if (typeof content.content !== 'string') {
          return [];
        }

        const imageRequest: docs_v1.Schema$Request[] = [
          {
            insertInlineImage: {
              location: {
                index: startIndex
              },
              uri: content.content,
              objectSize: content.imageOptions ? {
                height: content.imageOptions.height ? {
                  magnitude: content.imageOptions.height,
                  unit: 'PT'
                } : undefined,
                width: content.imageOptions.width ? {
                  magnitude: content.imageOptions.width,
                  unit: 'PT'
                } : undefined
              } : undefined
            }
          },
          // Add a newline after the image
          {
            insertText: {
              location: { index: startIndex + 1 },
              text: '\n'
            }
          }
        ];

        return imageRequest;

      default:
        return [];
    }
  }
} 