import 'server-only'

import {
  Document,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#292524',
  },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#78716c', marginBottom: 18 },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 6,
    color: '#78350f',
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    paddingVertical: 6,
  },
  headerRow: {
    backgroundColor: '#f5f5f4',
  },
  headerCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#78716c',
  },
  totalsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#292524',
    paddingVertical: 8,
    marginTop: 2,
  },
  totalsCell: { fontFamily: 'Helvetica-Bold' },
  cellRight: { textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#a8a29e',
    textAlign: 'center',
  },
})

export type ReportColumn = {
  header: string
  width: `${number}%`
  align?: 'left' | 'right'
}

export type ReportSection = {
  heading?: string
  rows: string[][]
}

type Props = {
  title: string
  subtitle: string
  columns: ReportColumn[]
  sections: ReportSection[]
  totalsRow?: string[]
}

function Row({
  cells,
  columns,
  bold = false,
}: {
  cells: string[]
  columns: ReportColumn[]
  bold?: boolean
}) {
  return (
    <View style={styles.row} wrap={false}>
      {cells.map((cell, i) => (
        <Text
          key={i}
          style={[
            { width: columns[i]?.width ?? 'auto' },
            columns[i]?.align === 'right' ? styles.cellRight : undefined,
            bold ? styles.totalsCell : undefined,
          ]}
        >
          {cell}
        </Text>
      ))}
    </View>
  )
}

function ReportDocument({
  title,
  subtitle,
  columns,
  sections,
  totalsRow,
}: Props) {
  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {sections.map((section, si) => (
          <View key={si}>
            {section.heading && (
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            )}
            <View style={styles.table}>
              <View style={[styles.row, styles.headerRow]} fixed>
                {columns.map((col, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.headerCell,
                      { width: col.width },
                      col.align === 'right' ? styles.cellRight : undefined,
                    ]}
                  >
                    {col.header}
                  </Text>
                ))}
              </View>
              {section.rows.length === 0 ? (
                <View style={styles.row}>
                  <Text style={{ color: '#a8a29e' }}>Nenhum registro.</Text>
                </View>
              ) : (
                section.rows.map((cells, ri) => (
                  <Row key={ri} cells={cells} columns={columns} />
                ))
              )}
            </View>
          </View>
        ))}

        {totalsRow && (
          <View style={styles.totalsRow}>
            {totalsRow.map((cell, i) => (
              <Text
                key={i}
                style={[
                  styles.totalsCell,
                  { width: columns[i]?.width ?? 'auto' },
                  columns[i]?.align === 'right' ? styles.cellRight : undefined,
                ]}
              >
                {cell}
              </Text>
            ))}
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}

export async function renderReportPdf(props: Props): Promise<Buffer> {
  return renderToBuffer(<ReportDocument {...props} />)
}
