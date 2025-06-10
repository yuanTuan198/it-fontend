import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

interface Asset {
  _id: string;
  code: string;
  name: string;
  type: string;
  importDate: string;
  stockQuantity: number;
  realQuantity: number;
  department: string;
}

const departments = [
  '-- CO DIEN --',
  'SERVER',
  'KINH DOANH',
  'KẾ TOÁN',
  'NGHIEN CUU',
  'QC',
  'THIET KE',
  'TONG VU',
  'XUONG'
];

const AssetManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [filterDept, setFilterDept] = useState<string>('');

  const [form, setForm] = useState<Omit<Asset, '_id'>>({
    code: '',
    name: '',
    type: '',
    importDate: '',
    stockQuantity: 0,
    realQuantity: 0,
    department: '',
  });

  const fetchAssets = async () => {
    const res = await axios.get<Asset[]>('http://14.161.43.226:4000/assets');
    setAssets(res.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (filterDept && filterDept !== '-- CO DIEN --') {
      setFilteredAssets(assets.filter(a => a.department === filterDept));
    } else {
      setFilteredAssets(assets);
    }
  }, [assets, filterDept]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('Quantity') ? parseInt(value) || 0 : value,
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formatted = format(date, 'yyyy-MM-dd');
      setForm(prev => ({ ...prev, importDate: formatted }));
      setShowCalendar(false);
    }
  };

  const addAsset = async () => {
    const res = await axios.post('http://14.161.43.226:4000/assets', form);
    setAssets(prev => [...prev, res.data]);
  };

  const updateAsset = async () => {
    if (!editingAsset) return;
    await axios.put(`http://14.161.43.226:4000/assets/${editingAsset._id}`, form);
    fetchAssets();
  };

  const deleteAsset = async (id: string) => {
    await axios.delete(`http://14.161.43.226:4000/assets/${id}`);
    setAssets(prev => prev.filter(asset => asset._id !== id));
  };

  const exportToExcel = () => {
    const data = filteredAssets.map(asset => ({
      'Mã tài sản': asset.code,
      'Tên': asset.name,
      'Loại': asset.type,
      'Ngày nhập': asset.importDate,
      'SL kho': asset.stockQuantity,
      'SL thực tế': asset.realQuantity,
      'Phòng ban': asset.department,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tài sản');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(file, 'DanhSachTaiSan.xlsx');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    setForm({
      code: '',
      name: '',
      type: '',
      importDate: '',
      stockQuantity: 0,
      realQuantity: 0,
      department: '',
    });
    setSelectedDate(undefined);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">📦 Quản lý tài sản</h2>

      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition hover:scale-105 cursor-pointer"
            onClick={() => {
              setForm({
                code: '',
                name: '',
                type: '',
                importDate: '',
                stockQuantity: 0,
                realQuantity: 0,
                department: '',
              });
              setEditingAsset(null);
              setIsModalOpen(true);
            }}
          >
            + Thêm tài sản
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow transition hover:scale-105 cursor-pointer"
            onClick={exportToExcel}
          >
            ⬇ Xuất Excel
          </button>
        </div>

        <select
          className="border px-3 py-2 rounded shadow text-gray-700"
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          {departments.map(dep => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl relative animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editingAsset ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}
            </h3>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl cursor-pointer"
              onClick={handleModalClose}
            >
              ✕
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <input name="code" placeholder="Mã tài sản" className="border p-2 rounded" value={form.code} onChange={handleChange} />
              <input name="name" placeholder="Tên tài sản" className="border p-2 rounded" value={form.name} onChange={handleChange} />
              <input name="type" placeholder="Loại tài sản" className="border p-2 rounded" value={form.type} onChange={handleChange} />

              <div className="relative">
                <input
                  name="importDate"
                  value={form.importDate}
                  onClick={() => setShowCalendar(prev => !prev)}
                  placeholder="Chọn ngày nhập"
                  className="border p-2 rounded w-full cursor-pointer"
                  readOnly
                />
                {showCalendar && (
                  <div className="absolute z-50 mt-2 bg-white shadow-lg rounded border">
                    <DayPicker mode="single" selected={selectedDate} onSelect={handleDateSelect} />
                  </div>
                )}
              </div>

              <input name="stockQuantity" type="number" placeholder="SL kho" className="border p-2 rounded" value={form.stockQuantity} onChange={handleChange} />
              <input name="realQuantity" type="number" placeholder="SL thực tế" className="border p-2 rounded" value={form.realQuantity} onChange={handleChange} />

              <select name="department" className="border p-2 rounded" value={form.department} onChange={handleChange}>
                {departments.map(dep => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded" onClick={handleModalClose}>
                Hủy
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={async () => {
                  if (editingAsset) {
                    await updateAsset();
                  } else {
                    await addAsset();
                  }
                  handleModalClose();
                }}
              >
                {editingAsset ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-gray-700 shadow rounded-lg">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="border p-2">Mã tài sản</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Loại</th>
              <th className="border p-2">Ngày nhập</th>
              <th className="border p-2">SL kho</th>
              <th className="border p-2">SL thực tế</th>
              <th className="border p-2">Phòng ban</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset._id} className="hover:bg-gray-50 transition">
                <td className="border p-2">{asset.code}</td>
                <td className="border p-2">{asset.name}</td>
                <td className="border p-2">{asset.type}</td>
                <td className="border p-2">{asset.importDate}</td>
                <td className="border p-2">{asset.stockQuantity}</td>
                <td className="border p-2">{asset.realQuantity}</td>
                <td className="border p-2">{asset.department}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition hover:scale-105"
                    onClick={() => {
                      setEditingAsset(asset);
                      setForm({ ...asset });
                      setSelectedDate(asset.importDate ? new Date(asset.importDate) : undefined);
                      setIsModalOpen(true);
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition hover:scale-105"
                    onClick={() => deleteAsset(asset._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-500">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetManager;
