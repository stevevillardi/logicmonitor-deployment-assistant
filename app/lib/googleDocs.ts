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
        const document = await this.docs.documents.get({
          documentId: existingDocId
        });
        
        if (document.data.body?.content) {
          const lastContent = document.data.body.content[document.data.body.content.length - 1];
          currentEndIndex = lastContent.endIndex || 1;
          
          if (currentEndIndex > 1) {
            await this.docs.documents.batchUpdate({
              documentId,
              requestBody: {
                requests: [{
                  deleteContentRange: {
                    range: {
                      startIndex: 1,
                      endIndex: Math.max(1, currentEndIndex - 1)
                    }
                  }
                }]
              }
            });
            currentEndIndex = 1;
          }
        }
      } else {
        const document = await this.docs.documents.create({
          requestBody: { title },
        });
        documentId = document.data.documentId!;
  
        await this.drive.permissions.create({
          fileId: documentId,
          requestBody: {
            type: 'user',
            role: 'writer',
            emailAddress: userEmail
          },
          supportsAllDrives: true
        });
  
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      // Process each content item
      for (const content of contents) {
        if (content.type === 'table') {
          const rows = content.content;
          
          // Step 1: Insert newline and create table with all rows
          await this.docs.documents.batchUpdate({
            documentId,
            requestBody: {
              requests: [
                {
                  insertText: {
                    location: { index: currentEndIndex },
                    text: '\n'
                  }
                },
                {
                  insertTable: {
                    location: { index: currentEndIndex + 1 },
                    rows: rows.length,
                    columns: rows[0].length
                  }
                }
              ]
            }
          });
  
          // Step 2: Get updated document to find table location
          const updatedDoc = await this.docs.documents.get({
            documentId
          });
  
          // Find the table we just created
          const tableElement = updatedDoc.data.body!.content!.find(
            element => element.table && 
            element.startIndex! >= currentEndIndex
          );
  
          if (tableElement && tableElement.startIndex) {
            let cellIndex = tableElement.startIndex + 1;
            
            // Fill in table cells row by row
            for (let i = 0; i < rows.length; i++) {
              const cellRequests = rows[i].map((cellContent: any, j: any) => ({
                insertText: {
                  location: { index: cellIndex + (j * 2) },
                  text: cellContent?.toString() || ' '
                }
              }));
  
              await this.docs.documents.batchUpdate({
                documentId,
                requestBody: { requests: cellRequests }
              });
  
              cellIndex += (rows[i].length * 2) + 1; // Move to next row
            }
  
            currentEndIndex = cellIndex + 1;
          }
  
          // Step 3: Add newline after table
          await this.docs.documents.batchUpdate({
            documentId,
            requestBody: {
              requests: [{
                insertText: {
                  location: { index: currentEndIndex },
                  text: '\n'
                }
              }]
            }
          });
          currentEndIndex++;
  
        } else {
          const requests = this.createContentRequest(content, currentEndIndex);
          if (requests.length > 0) {
            await this.docs.documents.batchUpdate({
              documentId,
              requestBody: { requests },
            });
            
            switch (content.type) {
              case 'bulletList':
              case 'numberedList': {
                const items = Array.isArray(content.content) ? content.content : [content.content];
                currentEndIndex += items.reduce((acc, item) => acc + item.length + 2, 0);
                break;
              }
              case 'image':
                currentEndIndex += 2;
                break;
              default:
                currentEndIndex += content.content.length + 1;
            }
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
  
      // Remove table case as it's handled in createOrUpdateDocument
  
      case 'bulletList':
      case 'numberedList': {
        const items = Array.isArray(content.content) ? content.content : [content.content];
        const requests: docs_v1.Schema$Request[] = [];
        let currentIndex = startIndex;
  
        items.forEach(item => {
          requests.push({
            insertText: {
              location: { index: currentIndex },
              text: item + '\n'
            }
          });
          currentIndex += item.length + 1;
        });
  
        requests.push({
          createParagraphBullets: {
            range: {
              startIndex: startIndex,
              endIndex: currentIndex - 1
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
  
        return [{
          insertInlineImage: {
            location: { index: startIndex },
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
        }, {
          insertText: {
            location: { index: startIndex + 1 },
            text: '\n'
          }
        }];
  
      default:
        return [];
    }
  }
}