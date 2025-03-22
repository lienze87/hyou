import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Progress, Upload } from "antd";
import React, { useState } from "react";

const Uploader: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [uploading, setUploading] = useState(false); // 添加上传状态
  const userId = localStorage.getItem("userId") || "1";

  const props: UploadProps = {
    name: "file",
    action: `/api/upload/${userId}`,
    showUploadList: false,
    onChange(info) {
      if (info.file.status === "uploading") {
        setUploading(true);
        setProgressVisible(true);
        if (info.file.percent) {
          setUploadProgress(Math.round(info.file.percent));
        }
      } else if (info.file.status === "done") {
        setUploading(false);
        setProgressVisible(false);
        const response = info.file.response;
        if (response.code === 200) {
          message.success(`${info.file.name} 上传成功`);
        } else {
          message.error(response.message || "上传失败");
        }
      } else if (info.file.status === "error") {
        setUploading(false);
        setProgressVisible(false);
        message.error(`${info.file.name} 上传失败`);
      }
    },
    beforeUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 20;
      if (!isLt10M) {
        message.error("文件大小不能超过 20MB！");
        return false;
      }
      setUploadProgress(0);
      return true;
    },
  };

  return (
    <div className="relative">
      <Upload {...props}>
        <Button ghost icon={<UploadOutlined />} disabled={uploading}>
          {uploading ? "上传中..." : "上传"}
        </Button>
      </Upload>
      {progressVisible && (
        <div className="absolute top-12 right-0 flex w-48 bg-white p-3 rounded shadow-md">
          <Progress percent={uploadProgress} size="small" />
        </div>
      )}
    </div>
  );
};

export default Uploader;
