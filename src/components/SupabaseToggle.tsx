import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Database, HardDrive } from 'lucide-react'

export const SupabaseToggle = () => {
  const { useSupabase, setUseSupabase, isAuthenticated, logout } = useAuth()

  const handleToggle = async (checked: boolean) => {
    if (isAuthenticated) {
      // Logout user when switching storage methods
      logout()
    }
    setUseSupabase(checked)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {useSupabase ? (
            <>
              <Database className="h-5 w-5 text-blue-500" />
              Supabase Database
            </>
          ) : (
            <>
              <HardDrive className="h-5 w-5 text-gray-500" />
              Local Storage
            </>
          )}
        </CardTitle>
        <CardDescription>
          {useSupabase 
            ? 'Data disimpan di cloud database dengan sinkronisasi real-time'
            : 'Data disimpan secara lokal di browser (untuk development)'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="supabase-mode"
            checked={useSupabase}
            onCheckedChange={handleToggle}
          />
          <Label htmlFor="supabase-mode">
            {useSupabase ? 'Mode Supabase' : 'Mode Local Storage'}
          </Label>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {useSupabase ? (
            <div className="space-y-2">
              <p>✅ Data tersimpan permanen di cloud</p>
              <p>✅ Akses dari berbagai device</p>
              <p>✅ Backup otomatis</p>
              <p>✅ Multi-user support</p>
              <p>⚠️ Memerlukan koneksi internet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>✅ Tidak memerlukan internet</p>
              <p>✅ Cepat untuk development</p>
              <p>❌ Data hilang jika browser di-reset</p>
              <p>❌ Tidak bisa sync antar device</p>
              <p>❌ Single user only</p>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Mengubah mode storage akan logout user yang sedang aktif
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SupabaseToggle
