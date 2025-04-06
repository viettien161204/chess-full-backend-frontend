import React, { useState, useEffect } from "react";
import { Table, Modal, Input, DatePicker, message } from "antd";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

const USERS_API_URL = "https://api.chessvn.io.vn/api/users";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDay: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(USERS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedUsers = response.data.map((user) => ({
        ...user,
        birthDay: user.birthDay ? dayjs(user.birthDay) : null,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      message.error("Không thể lấy danh sách người dùng.");
    }
  };

  const handleOpen = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        birthDay: user.birthDay || null,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        birthDay: null,
        email: "",
        password: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const updatedData = {
        ...formData,
        birthDay: formData.birthDay ? formData.birthDay.format("YYYY-MM-DD") : "",
      };
      if (editingUser) {
        const originalUser = users.find((u) => u.id === editingUser.id);
        await axios.put(`${USERS_API_URL}/${editingUser.id}`, {
          ...updatedData,
          email: originalUser.email,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(USERS_API_URL, {
          ...updatedData,
          email: formData.email,
          password: formData.password,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchUsers();
      setOpen(false);
      message.success("Lưu thành công");
    } catch (error) {
      message.error("Lỗi khi lưu người dùng");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${USERS_API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      message.success("Xóa thành công");
    } catch (error) {
      message.error("Lỗi khi xóa người dùng");
    }
  };

  const columns = [
    {
      title: <span className="text-blue-900 font-semibold">Họ và Tên</span>,
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      render: (_, record) => (
        <span className="text-black">
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: <span className="text-blue-900 font-semibold">Email</span>,
      dataIndex: "email",
      key: "email",
      align: "center",
      render: (text) => <span className="text-black">{text}</span>,
    },
    {
      title: <span className="text-blue-900 font-semibold">Ngày sinh</span>,
      dataIndex: "birthDay",
      key: "birthDay",
      align: "center",
      render: (date) => (
        <span className="text-black">
          {date ? dayjs(date).format("DD/MM/YYYY") : "Không có dữ liệu"}
        </span>
      ),
    },
    {
      title: <span className="text-blue-900 font-semibold">Hành động</span>,
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleOpen(record)}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full shadow-[0_0_12px_rgba(59,130,246,0.7)] hover:from-blue-500 hover:to-blue-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.9)] transition-all duration-300"
          >
            <FaEdit className="text-sm" />
            <span>Sửa</span>
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-600 to-red-400 text-white rounded-full shadow-[0_0_12px_rgba(244,63,94,0.7)] hover:from-red-500 hover:to-red-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.9)] transition-all duration-300"
          >
            <FaTrash className="text-sm" />
            <span>Xóa</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => handleOpen()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full shadow-[0_0_12px_rgba(59,130,246,0.7)] hover:from-blue-500 hover:to-blue-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.9)] hover:scale-105 transition-all duration-300"
        >
          <FaPlus />
          Thêm người dùng
        </button>
      </div>

      <div className="bg-gray-900/80 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.6)] backdrop-blur-lg overflow-hidden neon-border">
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          className="custom-table"
          rowClassName={() => "bg-gray-200 bg-opacity-30 backdrop-blur-lg hover:bg-blue-900/30 transition-all duration-300"}
          scroll={{ x: "max-content" }}
          pagination={{
            className: "text-white px-4 py-2 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]",
            itemRender: (_, type, originalElement) => {
              if (type === "prev" || type === "next") {
                return (
                  <button className="text-white hover:text-blue-100 px-2 transition-all duration-300">
                    {originalElement}
                  </button>
                );
              }
              return originalElement;
            },
          }}
        />
      </div>

      <Modal
        title={
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
            {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
          </span>
        }
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:rounded-2xl [&_.ant-modal-content]:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
        okButtonProps={{
          className: "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white shadow-[0_0_12px_rgba(59,130,246,0.7)]",
        }}
        cancelButtonProps={{
          className: "bg-gray-200 hover:bg-gray-300 text-black shadow-[0_0_12px_rgba(59,130,246,0.5)]",
        }}
      >
        <div className="space-y-4">
          <Input
            placeholder="Họ"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="bg-white border-gray-300 text-black placeholder-gray-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 rounded-lg"
          />
          <Input
            placeholder="Tên"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="bg-white border-gray-300 text-black placeholder-gray-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 rounded-lg"
          />
          {editingUser ? (
            <Input
              placeholder="Email"
              value={editingUser.email}
              disabled
              className="bg-gray-100 border-gray-300 text-black placeholder-gray-400 rounded-lg"
            />
          ) : (
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-white border-gray-300 text-black placeholder-gray-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 rounded-lg"
              type="email"
            />
          )}
          <DatePicker
            placeholder="Ngày sinh"
            value={formData.birthDay}
            onChange={(date) => setFormData({ ...formData, birthDay: date })}
            className="w-full bg-white border-gray-300 [&_input]:text-black [&_input]:placeholder-gray-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 rounded-lg"
          />
          {!editingUser && (
            <Input.Password
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-white border-gray-300 text-black placeholder-gray-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300 rounded-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Admin;