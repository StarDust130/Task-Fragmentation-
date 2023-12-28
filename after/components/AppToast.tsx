import React from "react";

const AppToast = () => {
  return (
    <>
      <AppToast
        position={{ vertical: "bottom", horizontal: "center" }}
        message={toastMsg}
        severity={toastSev}
      />
    </>
  );
}
export default AppToast