// app/api/generate-report-docx/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
         AlignmentType, HeadingLevel, BorderStyle, WidthType, LevelFormat,
         ShadingType, UnderlineType, PageBreak } from 'docx';

export async function POST(request: NextRequest) {
  try {
    const { report } = await request.json();

    if (!report) {
      return NextResponse.json({ error: 'No report data provided' }, { status: 400 });
    }

    // Define borders
    const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
    const cellBorders = { 
      top: tableBorder, 
      bottom: tableBorder, 
      left: tableBorder, 
      right: tableBorder 
    };

    // Create document
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Arial", size: 24 } // 12pt default
          }
        },
        paragraphStyles: [
          {
            id: "Title",
            name: "Title",
            basedOn: "Normal",
            run: { size: 56, bold: true, color: "1a56db", font: "Arial" },
            paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER }
          },
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 32, bold: true, color: "1a56db", font: "Arial" },
            paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: { size: 28, bold: true, color: "4b5563", font: "Arial" },
            paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
          },
          {
            id: "SubtleText",
            name: "Subtle Text",
            basedOn: "Normal",
            run: { size: 20, color: "6b7280", font: "Arial" },
            paragraph: { spacing: { after: 120 } }
          }
        ]
      },
      numbering: {
        config: [
          {
            reference: "bullet-list",
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: "•",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              }
            ]
          },
          {
            reference: "numbered-recommendations",
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: "%1.",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              }
            ]
          }
        ]
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          },
          children: [
            // ========== TITLE ==========
            new Paragraph({
              heading: HeadingLevel.TITLE,
              children: [new TextRun("Learning Assessment Report")]
            }),

            new Paragraph({
              style: "SubtleText",
              alignment: AlignmentType.CENTER,
              children: [new TextRun(`Generated on ${new Date(report.generatedAt).toLocaleDateString()}`)]
            }),

            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== STUDENT INFORMATION TABLE ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Student Information")]
            }),

            new Table({
              columnWidths: [3120, 6240],
              margins: { top: 100, bottom: 100, left: 180, right: 180 },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 3120, type: WidthType.DXA },
                      shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Student Name", bold: true })]
                      })]
                    }),
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 6240, type: WidthType.DXA },
                      children: [new Paragraph({
                        children: [new TextRun(report.studentName)]
                      })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 3120, type: WidthType.DXA },
                      shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Age", bold: true })]
                      })]
                    }),
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 6240, type: WidthType.DXA },
                      children: [new Paragraph({
                        children: [new TextRun(`${report.age} years`)]
                      })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 3120, type: WidthType.DXA },
                      shading: { fill: "E5E7EB", type: ShadingType.CLEAR },
                      children: [new Paragraph({
                        children: [new TextRun({ text: "Assessment Date", bold: true })]
                      })]
                    }),
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 6240, type: WidthType.DXA },
                      children: [new Paragraph({
                        children: [new TextRun(new Date(report.assessmentDate).toLocaleDateString())]
                      })]
                    })
                  ]
                })
              ]
            }),

            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== EXECUTIVE SUMMARY ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Executive Summary")]
            }),

            new Paragraph({
              spacing: { before: 120, after: 240 },
              children: [new TextRun(report.executiveSummary)]
            }),

            // ========== COGNITIVE DOMAIN SCORES ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Cognitive Domain Performance")]
            }),

            // Create score table
            new Table({
              columnWidths: [3120, 2340, 3900],
              margins: { top: 100, bottom: 100, left: 180, right: 180 },
              rows: [
                // Header row
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 3120, type: WidthType.DXA },
                      shading: { fill: "3B82F6", type: ShadingType.CLEAR },
                      children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Domain", bold: true, color: "FFFFFF" })]
                      })]
                    }),
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 2340, type: WidthType.DXA },
                      shading: { fill: "3B82F6", type: ShadingType.CLEAR },
                      children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Score", bold: true, color: "FFFFFF" })]
                      })]
                    }),
                    new TableCell({
                      borders: cellBorders,
                      width: { size: 3900, type: WidthType.DXA },
                      shading: { fill: "3B82F6", type: ShadingType.CLEAR },
                      children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Game Used", bold: true, color: "FFFFFF" })]
                      })]
                    })
                  ]
                }),
                // Score rows
                ...report.detailedScores.map((domain: any) => 
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: cellBorders,
                        width: { size: 3120, type: WidthType.DXA },
                        children: [new Paragraph({
                          children: [new TextRun({ text: domain.name, bold: true })]
                        })]
                      }),
                      new TableCell({
                        borders: cellBorders,
                        width: { size: 2340, type: WidthType.DXA },
                        children: [new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [new TextRun({ 
                            text: `${domain.score}%`, 
                            bold: true,
                            color: domain.score >= 80 ? "16A34A" : domain.score >= 60 ? "CA8A04" : "DC2626"
                          })]
                        })]
                      }),
                      new TableCell({
                        borders: cellBorders,
                        width: { size: 3900, type: WidthType.DXA },
                        children: [new Paragraph({
                          children: [new TextRun(domain.gameUsed)]
                        })]
                      })
                    ]
                  })
                )
              ]
            }),

            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== DETAILED METRICS ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Detailed Performance Metrics")]
            }),

            ...report.detailedScores.flatMap((domain: any) => [
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun(domain.name)]
              }),
              new Table({
                columnWidths: [4680, 4680],
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                rows: domain.metrics.map((metric: any) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        borders: cellBorders,
                        width: { size: 4680, type: WidthType.DXA },
                        shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
                        children: [new Paragraph({
                          children: [new TextRun({ text: metric.label, bold: true })]
                        })]
                      }),
                      new TableCell({
                        borders: cellBorders,
                        width: { size: 4680, type: WidthType.DXA },
                        children: [new Paragraph({
                          children: [new TextRun(String(metric.value))]
                        })]
                      })
                    ]
                  })
                )
              }),
              new Paragraph({ children: [new TextRun("")] }) // Spacer
            ]),

            // ========== PAGE BREAK ==========
            new Paragraph({ children: [new PageBreak()] }),

            // ========== STRENGTHS ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Key Strengths")]
            }),

            ...report.strengths.map((strength: string) =>
              new Paragraph({
                numbering: { reference: "bullet-list", level: 0 },
                children: [new TextRun(strength)]
              })
            ),

            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== AREAS FOR DEVELOPMENT ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Areas for Development")]
            }),

            ...report.areasForDevelopment.map((area: string) =>
              new Paragraph({
                numbering: { reference: "bullet-list", level: 0 },
                children: [new TextRun(area)]
              })
            ),

            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== DETAILED ANALYSIS ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Detailed Analysis")]
            }),

            ...report.detailedAnalysis.flatMap((analysis: any) => [
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                children: [new TextRun(analysis.domain)]
              }),
              new Paragraph({
                spacing: { before: 120, after: 240 },
                children: [new TextRun(analysis.observation)]
              })
            ]),

            // ========== RECOMMENDATIONS ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Professional Recommendations")]
            }),

            ...report.recommendations.flatMap((rec: any, idx: number) => [
              new Paragraph({
                numbering: { reference: "numbered-recommendations", level: 0 },
                spacing: { before: 180 },
                children: [new TextRun({ text: rec.title, bold: true })]
              }),
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 180 },
                children: [new TextRun(rec.description)]
              })
            ]),

            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== NEXT STEPS ==========
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [new TextRun("Next Steps")]
            }),

            ...report.nextSteps.map((step: string) =>
              new Paragraph({
                numbering: { reference: "bullet-list", level: 0 },
                children: [new TextRun(step)]
              })
            ),

            new Paragraph({ children: [new TextRun("")] }), // Spacer
            new Paragraph({ children: [new TextRun("")] }), // Spacer

            // ========== DISCLAIMER ==========
            new Paragraph({
              spacing: { before: 360 },
              border: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
              },
              children: [new TextRun({ 
                text: "Disclaimer", 
                bold: true, 
                size: 22 
              })]
            }),

            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({
                text: "This report is generated using game-based learning analytics and should be used as a supplementary tool. It is not a substitute for professional psychological or educational assessment. For comprehensive evaluation, please consult with qualified professionals.",
                size: 20,
                color: "6B7280"
              })]
            })
          ]
        }
      ]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${report.studentName}_Assessment_Report.docx"`
      }
    });

  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}