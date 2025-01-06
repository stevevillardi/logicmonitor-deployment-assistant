import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';
import {
    Document,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    convertInchesToTwip,
    PageNumber,
    Header,
    Footer,
    ImageRun,
    Shading,
    TableBorders,
    Packer,
    ShadingType
} from 'docx';

const DARK_BLUE = '00205B';
const LIGHT_BLUE = '0046E5';
const WHITE = 'FFFFFF';
const START_GRADIENT = '275399';
const END_GRADIENT = '040C4E';

export async function POST(req: NextRequest) {
    try {
        const { contents, title } = await req.json();

        // Read the logo file from the public directory
        const logoPath = path.join(process.cwd(), 'public', 'logicmonitor_logo.png');
        const logoData = await fs.readFile(logoPath);

        const doc = new Document({
            styles: {
                default: {
                    heading1: {
                        run: {
                            font: 'DM Sans',
                            size: 28,
                            color: DARK_BLUE,
                            bold: true
                        },
                        paragraph: {
                            spacing: { before: 240, after: 120 }
                        }
                    },
                    document: {
                        run: {
                            font: 'DM Sans',
                            size: 22,
                            color: '000000'
                        },
                        paragraph: {
                            spacing: { before: 120, after: 120 }
                        }
                    }
                }
            },
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(0.8),
                            right: convertInchesToTwip(0.8),
                            bottom: convertInchesToTwip(0.8),
                            left: convertInchesToTwip(0.8),
                        },
                    },
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: logoData,
                                        transformation: {
                                            width: 150,
                                            height: 40
                                        },
                                        type: 'png'
                                    })
                                ],
                                alignment: AlignmentType.RIGHT
                            })
                        ]
                    }),
                },
                children: contents.map((content: any) => {
                    switch (content.type) {
                        case 'table':
                            return new Table({
                                width: { size: 100, type: 'pct' },
                                borders: {
                                    top: { style: BorderStyle.NONE },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE },
                                },
                                rows: content.content.map((row: string[], rowIndex: number) =>
                                    new TableRow({
                                        tableHeader: rowIndex === 0,
                                        children: row.map((cell) =>
                                            new TableCell({
                                                children: [
                                                    // Split the cell content by newlines and create separate TextRuns
                                                    new Paragraph({
                                                        children: cell.split('\n').map((line, index, array) => [
                                                            new TextRun({
                                                                text: line,
                                                                font: 'DM Sans',
                                                                size: 22,
                                                                bold: rowIndex === 0,
                                                                color: rowIndex === 0 ? WHITE : '000000',
                                                            }),
                                                            // Add break if not the last line
                                                            ...(index < array.length - 1
                                                                ? [new TextRun({ text: '', break: 1 })]
                                                                : []
                                                            )
                                                        ]).flat(),
                                                    }),
                                                ],
                                                shading: rowIndex === 0 ? {
                                                    fill: DARK_BLUE,
                                                    type: 'clear',
                                                    color: DARK_BLUE
                                                } : undefined,
                                                margins: {
                                                    top: 120,
                                                    bottom: 120,
                                                    left: 120,
                                                    right: 120,
                                                },
                                                borders: {
                                                    top: { style: rowIndex === 0 ? BorderStyle.SINGLE : BorderStyle.NONE },
                                                    bottom: { style: BorderStyle.SINGLE, size: 1, color: rowIndex === 0 ? WHITE : DARK_BLUE },
                                                    left: { style: BorderStyle.NONE },
                                                    right: { style: BorderStyle.NONE },
                                                }
                                            })
                                        ),
                                    })
                                ),
                            });

                        case 'heading':
                            return new Paragraph({
                                text: content.content,
                                heading: HeadingLevel.HEADING_1,
                                spacing: { before: 480, after: 240 },
                                border: {
                                    bottom: {
                                        color: DARK_BLUE,
                                        space: 1,
                                        style: BorderStyle.NONE,
                                        size: 6
                                    }
                                }
                            });
                        case 'cover':
                            return [
                                // Background container that spans the whole page
                                new Paragraph({
                                    children: [
                                        // Title
                                        new TextRun({
                                            text: content.content.title + '\n\n',
                                            font: 'DM Sans',
                                            size: 44,
                                            bold: true,
                                            color: WHITE
                                        }),
                                        // Contacts
                                        ...content.content.contacts.flatMap((contact: any) => [
                                            new TextRun({
                                                text: contact.role + '\n',
                                                font: 'DM Sans',
                                                size: 24,
                                                color: WHITE
                                            }),
                                            new TextRun({
                                                text: contact.email + '\n\n',
                                                font: 'DM Sans',
                                                size: 24,
                                                color: LIGHT_BLUE
                                            })
                                        ]),
                                        // Add spacing to ensure background fills page
                                        new TextRun({
                                            text: '\n'.repeat(20),
                                        }),
                                    ],
                                    spacing: { before: 240, after: 240 },
                                    shading: {
                                        type: ShadingType.SOLID,
                                        fill: START_GRADIENT,
                                        color: END_GRADIENT
                                    }
                                }),
                                // Force a page break after the cover
                                new Paragraph({
                                    pageBreakBefore: true,
                                })
                            ];
                            case 'paragraph':
                                return content.content.split('\n\n').map((paragraph: string) => 
                                    new Paragraph({
                                        children: paragraph.split('\n').map((line: string, index: number, array: string[]) => [
                                            new TextRun({
                                                text: line,
                                                font: 'DM Sans',
                                                size: 22,
                                            }),
                                            // Add break if not the last line
                                            ...(index < array.length - 1 
                                                ? [new TextRun({ text: '', break: 1 })]
                                                : []
                                            )
                                        ]).flat(),
                                        spacing: { before: 120, after: 120 },
                                    })
                                );
                            
                            case 'section':
                                return [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: content.content.title,
                                                font: 'DM Sans',
                                                size: 24,
                                                bold: true,
                                                color: DARK_BLUE
                                            })
                                        ],
                                        spacing: { before: 240, after: 120 }
                                    }),
                                    ...content.content.items.map((item: string) =>
                                        new Paragraph({
                                            children: item.split('\n').map((line, index, array) => [
                                                new TextRun({
                                                    text: index === 0 ? '• ' + line : line,
                                                    font: 'DM Sans',
                                                    size: 22
                                                }),
                                                // Add break if not the last line
                                                ...(index < array.length - 1 
                                                    ? [new TextRun({ text: '', break: 1 })]
                                                    : []
                                                )
                                            ]).flat(),
                                            spacing: { before: 120, after: 120 }
                                        })
                                    )
                                ];

                        default:
                            return new Paragraph({
                                children: [
                                    new TextRun({
                                        text: content.content,
                                        font: 'DM Sans',
                                        size: 22
                                    })
                                ],
                                spacing: { before: 120, after: 120 }
                            });
                    }
                }).flat()
            }]
        });

        const buffer = await Packer.toBuffer(doc);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename=${encodeURIComponent(title)}.docx`,
            },
        });
    } catch (error) {
        console.error('Error generating document:', error);
        return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
    }
}