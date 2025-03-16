module.exports = {
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          use: { loader: "worker-loader" },
        },
        {
          test: /\.wasm$/,
          type: "asset/resource",
        },
        {
            test: /\.onnx$/,
            type: "asset/resource",
            generator: {
              filename: "static/[name][ext]",
            },
          },
        
      ],
    },
    // Đảm bảo WebAssembly được bật
    experiments: {
      asyncWebAssembly: true,
    },
  };