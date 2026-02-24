import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Plus, Trash2, Users, BarChart2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import * as api from '@/services/api';
import type { Holiday, User } from '@/types';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onHolidayChange: () => void;
}

export function AdminPanel({ onHolidayChange }: AdminPanelProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [occupancyData, setOccupancyData] = useState<{ date: string; occupancy: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const [holidaysResult, usersResult, occupancyResult] = await Promise.all([
      api.getHolidays(),
      api.getAllUsers(),
      api.getOccupancy(
        format(new Date(), 'yyyy-MM-dd'),
        format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      )
    ]);

    if (holidaysResult.success && holidaysResult.data) {
      setHolidays(holidaysResult.data);
    }
    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    }
    if (occupancyResult.success && occupancyResult.data) {
      setOccupancyData(occupancyResult.data);
    }

    setIsLoading(false);
  };

  const handleAddHoliday = async () => {
    if (!newHolidayDate || !newHolidayName) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsAddingHoliday(true);
    const result = await api.addHoliday(newHolidayDate, newHolidayName);
    
    if (result.success) {
      toast.success('Holiday added successfully');
      setShowAddHoliday(false);
      setNewHolidayDate('');
      setNewHolidayName('');
      loadData();
      onHolidayChange();
    } else {
      toast.error(result.error || 'Failed to add holiday');
    }
    
    setIsAddingHoliday(false);
  };

  const handleDeleteHoliday = async (id: string) => {
    const result = await api.deleteHoliday(id);
    if (result.success) {
      toast.success('Holiday deleted');
      loadData();
      onHolidayChange();
    } else {
      toast.error(result.error || 'Failed to delete holiday');
    }
  };

  const batch1Count = users.filter(u => u.batch === 1).length;
  const batch2Count = users.filter(u => u.batch === 2).length;
  const avgOccupancy = occupancyData.length > 0 
    ? Math.round(occupancyData.reduce((sum, d) => sum + d.occupancy, 0) / occupancyData.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Batch 1 Users</p>
                <p className="text-2xl font-bold text-blue-600">{batch1Count}</p>
              </div>
              <Badge variant="batch1" className="text-lg px-3 py-1">B1</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Batch 2 Users</p>
                <p className="text-2xl font-bold text-emerald-600">{batch2Count}</p>
              </div>
              <Badge variant="batch2" className="text-lg px-3 py-1">B2</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">{avgOccupancy}%</p>
              </div>
              <BarChart2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            Occupancy Forecast (Next 2 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-2">
            {occupancyData.filter((_, i) => i % 2 === 0).slice(0, 7).map((data) => (
              <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all"
                  style={{ height: `${Math.max(data.occupancy, 5)}%` }}
                />
                <span className="text-xs text-gray-500">
                  {format(parseISO(data.date), 'MMM d')}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {data.occupancy}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Holiday Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-500" />
            Holiday Management
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddHoliday(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Holiday
          </Button>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No holidays configured</p>
              <p className="text-sm">Add holidays to block booking on those days</p>
            </div>
          ) : (
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{holiday.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(holiday.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            User Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Batch</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.batch === 1 ? 'batch1' : 'batch2'}>
                        Batch {user.batch}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'admin' ? 'danger' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={showAddHoliday}
        onClose={() => setShowAddHoliday(false)}
        title="Add Holiday"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={newHolidayDate}
            onChange={(e) => setNewHolidayDate(e.target.value)}
          />
          <Input
            label="Holiday Name"
            placeholder="e.g., Christmas Day"
            value={newHolidayName}
            onChange={(e) => setNewHolidayName(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowAddHoliday(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleAddHoliday}
              isLoading={isAddingHoliday}
            >
              Add Holiday
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
