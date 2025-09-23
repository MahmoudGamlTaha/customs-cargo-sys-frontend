import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

//   useEffect(() => {
//     // Auto redirect to home after 5 seconds
//     const timer = setTimeout(() => {
//       navigate("/");
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [navigate]);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Arial', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Watermark Background */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.05,
          zIndex: 1,
          pointerEvents: "none",
          fontSize: "200px",
          fontWeight: "bold",
          color: "#1976d2",
          userSelect: "none",
        }}
      >
        404
      </div>

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: "600px",
          padding: "40px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Error Code */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: "bold",
            color: "#1976d2",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          404
        </div>

        {/* Error Message */}
        <h1
          style={{
            fontSize: "32px",
            color: "#333",
            marginBottom: "16px",
            fontWeight: "600",
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#666",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#1565c0";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#1976d2";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Go Home
          </button>

          {/* <button
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: "#1976d2",
              border: "2px solid #1976d2",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#1976d2";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#1976d2";
            }}
          >
            Go Back
          </button> */}
        </div>

        {/* Auto Redirect Notice */}
        {/* <p
          style={{
            fontSize: "14px",
            color: "#999",
            marginTop: "24px",
            fontStyle: "italic",
          }}
        >
          Redirecting to home page in 5 seconds...
        </p> */}
      </div>

      {/* Decorative Elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #1976d2, #42a5f5)",
          opacity: 0.1,
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #42a5f5, #1976d2)",
          opacity: 0.1,
          animation: "float 4s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "20%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(45deg, #1976d2, #42a5f5)",
          opacity: 0.1,
          animation: "float 5s ease-in-out infinite",
        }}
      />

      {/* CSS Animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
};

export default NotFoundPage;
