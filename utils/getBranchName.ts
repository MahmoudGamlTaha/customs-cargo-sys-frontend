// دالة للحصول على اسم الفرع من localStorage
export const getBranchName = (): string => {
  try {
    const branchName = localStorage.getItem("branchName");
    return branchName || "منفذ طرابلس"; // قيمة افتراضية
  } catch (error) {
    console.error("Error getting branch name from localStorage:", error);
    return "منفذ طرابلس"; // قيمة افتراضية في حالة الخطأ
  }
};

// دالة للحصول على اسم الفرع مع النص الكامل
export const getFullBranchTitle = (role: string): string => {
  const branchName = getBranchName();

  switch (role) {
    case "branch_admin":
      return `لوحة تحكم  ${branchName}`;
    case "staff":
      return `لوحة تحكم موظف  ${branchName}`;
    case "accountant":
      return `لوحة تحكم موظف  ${branchName}`;
    case "arbitrator":
      return `لوحة تحكم موظف  ${branchName}`;
    case "member":
      return `لوحة تحكم موظف  ${branchName}`;
    default:
      return `لوحة تحكم ${role} منفذ ${branchName}`;
  }
};
