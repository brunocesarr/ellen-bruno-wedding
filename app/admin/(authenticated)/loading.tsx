import { RomanticLoader } from '@/components/ui/RomanticLoader'

export default function AdminLoading() {
  return (
    <RomanticLoader
      message="Preparando o painel..."
      submessage="Buscando os últimos dados"
    />
  )
}
