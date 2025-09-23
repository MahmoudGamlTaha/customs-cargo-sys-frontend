/**
 * DataProcessor Class
 *
 * A powerful and flexible class for processing backend data before displaying in UI.
 * This class can be easily extended for various data transformation needs.
 *
 * Features:
 * - Enable/Disable functionality with boolean flag
 * - Data transformation methods
 * - Extensible architecture for future enhancements
 * - Type-safe operations
 */

export interface BranchData {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export interface PortData {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface BranchesResponse {
  branches: BranchData[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface PortsResponse {
  branches: PortData[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface RoleData {
  id: number;
  created_at: string;
  updated_at: string;
  name_ar: string;
  name_en: string;
  code: string;
}

export interface RolesResponse {
  success: boolean;
  message: string;
  data: RoleData[];
  timestamp: string;
}

export interface UserData {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role_id: number | null;
  company_id: number | null;
  branch_id: number;
  is_active: boolean;
  email_verified: boolean;
  is_password_reset_required: boolean;
  last_login: string | null;
  role: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    pagination: {
      page: number;
      page_size: number;
      total: number;
      total_pages: number;
    };
    users: UserData[];
  };
  timestamp: string;
}

export interface LoginBranchData {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

export interface LoginUserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  email_verified: boolean;
  is_password_reset_required: boolean;
  created_at: string;
  last_login: string | null;
  branch_id: number;
  branch: LoginBranchData;
  role_name: string;
  role: string;
  role_id: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: LoginUserData;
    token: string;
  };
  timestamp: string;
}

export class DataProcessor {
  private static instance: DataProcessor;

  //   Switch ON/OFF the DataProcessor Effect
  private isEnabled: boolean = true;

  // Saved replacement data
  private replacementData: PortData[] = [
    {
      id: 32,
      name: "منفذ مصراتة",
      code: "LYMRA",
      address: "مصراتة",
      phone: "0912345678",
      email: "info@misrataport.ly",
    },
    {
      id: 23,
      name: "منفذ بنغازي",
      code: "LYBEN",
      address: "بنغازي",
      phone: "0923456789",
      email: "info@benghaziport.ly",
    },
    {
      id: 33,
      name: "منفذ طرابلس البحري",
      code: "LYTIP",
      address: "طرابلس",
      phone: "0945678901",
      email: "info@tripoliport.ly",
    },
  ];

  // Private constructor for Singleton pattern
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  /**
   * Enable or disable the processor
   * @param enabled - Boolean flag to enable/disable processing
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`DataProcessor ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Check if processor is enabled
   * @returns boolean - true if enabled, false otherwise
   */
  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Process branches data and transform to ports format
   * @param response - Backend response containing branches data
   * @returns Processed response with ports data or original if disabled
   */
  public processBranchesToPorts(
    response: BackendResponse<BranchesResponse>
  ): BackendResponse<PortsResponse> {
    // If processor is disabled, return original data
    if (!this.isEnabled) {
      console.log(
        "DataProcessor is disabled - returning original data",
        response
      );
      return response as any;
    }

    try {
      console.log("Processing branches data to ports format...");
      console.log("Input response:", response);

      // Check if response has the expected structure
      if (!response.data || !response.data.branches) {
        console.error("Invalid response structure:", response);
        return response as any;
      }

      // Use replacement data instead of transformation
      const ports: PortData[] = this.replaceWithSavedData(
        response.data.branches
      );

      // Create new response with ports data
      const processedResponse: BackendResponse<PortsResponse> = {
        success: response.success,
        message: response.message
          ? response.message.replace("Branches", "Ports")
          : "Ports retrieved",
        data: {
          branches: ports,
          pagination: response.data.pagination || {
            page: 1,
            page_size: 20,
            total: ports.length,
            total_pages: 1,
          },
        },
        timestamp: response.timestamp || new Date().toISOString(),
      };

      console.log(
        "Branches successfully replaced with saved ports data:",
        processedResponse
      );
      return processedResponse;
    } catch (error) {
      console.error("Error processing branches data:", error);
      // Return original data if processing fails
      return response as any;
    }
  }

  /**
   * Replace backend data with saved replacement data based on ID matching
   * @param backendBranches - Original branches data from backend
   * @returns Replaced data using saved replacement data
   */
  public replaceWithSavedData(backendBranches: BranchData[]): PortData[] {
    console.log("Replacing backend data with saved replacement data...");
    console.log("Backend branches:", backendBranches);
    console.log("Replacement data:", this.replacementData);

    // If no backend branches, return empty array
    if (!backendBranches || backendBranches.length === 0) {
      console.log("No backend branches to process");
      return [];
    }

    return backendBranches.map((branch: BranchData) => {
      // Find matching replacement data by ID (convert both to numbers for comparison)
      const branchId =
        typeof branch.id === "string" ? parseInt(branch.id) : branch.id;
      const replacement = this.replacementData.find(
        (item) => item.id === branchId
      );

      if (replacement) {
        console.log(
          `Found replacement for ID ${branchId}: ${replacement.name}`
        );
        return replacement;
      } else {
        // If no replacement found, transform the original data
        console.log(
          `No replacement found for ID ${branchId}, using transformation`
        );
        return this.transformBranchToPort(branch);
      }
    });
  }

  /**
   * Transform individual branch to port format
   * @param branch - Branch data to transform
   * @returns Port data
   */
  private transformBranchToPort(branch: BranchData): PortData {
    return {
      id: branch.id,
      name: `منفذ ${branch.name}`,
      code: this.generatePortCode(branch.code),
      address: branch.address,
      phone: this.formatPhoneNumber(branch.phone),
      email: this.formatEmail(branch.email, branch.name),
    };
  }

  /**
   * Generate port code from branch code
   * @param branchCode - Original branch code
   * @returns Formatted port code
   */
  private generatePortCode(branchCode: string): string {
    // Convert branch code to port code format
    // Example: "001" -> "LYMRA", "TNT" -> "LYBEN", "003" -> "LYTIP"
    const codeMap: { [key: string]: string } = {
      "001": "LYMRA",
      TNT: "LYBEN",
      "003": "LYTIP",
    };

    return codeMap[branchCode] || `LY${branchCode}`;
  }

  /**
   * Format phone number to port format
   * @param phone - Original phone number
   * @returns Formatted phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Format phone number to Libyan port format
    // Example: "1111111111111" -> "0912345678"
    const phoneMap: { [key: string]: string } = {
      "1111111111111": "0912345678",
      "0555555555": "0923456789",
      "00218913434444": "0945678901",
    };

    // Generate a realistic Libyan phone number based on the original
    if (phoneMap[phone]) {
      return phoneMap[phone];
    }

    // Create a realistic Libyan mobile number (09XXXXXXXX)
    const randomSuffix = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");
    return `09${randomSuffix}`;
  }

  /**
   * Format email to port format
   * @param email - Original email
   * @param branchName - Branch name for context
   * @returns Formatted email
   */
  private formatEmail(email: string, branchName: string): string {
    // Format email to port format
    const emailMap: { [key: string]: string } = {
      "glucc@gmail.com": "info@misrataport.ly",
      "T@yahoo.com": "info@benghaziport.ly",
      "info@gucc.ly": "info@tripoliport.ly",
    };

    return (
      emailMap[email] ||
      `info@${branchName.toLowerCase().replace(/\s+/g, "")}port.ly`
    );
  }

  /**
   * Process roles data - remove unwanted roles and update names
   * @param response - Backend response containing roles data
   * @returns Processed response with filtered and updated roles
   */
  public processRoles(response: RolesResponse): RolesResponse {
    // If processor is disabled, return original data
    if (!this.isEnabled) {
      console.log("DataProcessor is disabled - returning original roles data");
      return response;
    }

    try {
      console.log("Processing roles data...");
      console.log("Input roles:", response.data);

      // Filter out unwanted roles and update names
      const processedRoles = response.data
        .filter((role: RoleData) => {
          // Remove: عميل (client), محاسب (accountant), مدقق (auditor)
          const unwantedCodes = ["client", "accountant", "auditor"];
          return !unwantedCodes.includes(role.code);
        })
        .map((role: RoleData) => {
          // Update branch_admin to مدير منفذ and change code to port_manager
          if (role.code === "branch_admin") {
            return {
              ...role,
              name_ar: "مدير منفذ",
              name_en: "Port Manager",
              code: "port_manager",
            };
          }
          return role;
        });

      const processedResponse: RolesResponse = {
        success: response.success,
        message: response.message,
        data: processedRoles,
        timestamp: response.timestamp,
      };

      console.log("Roles successfully processed:", processedResponse);
      return processedResponse;
    } catch (error) {
      console.error("Error processing roles data:", error);
      // Return original data if processing fails
      return response;
    }
  }

  /**
   * Process login data - update branch information in login response
   * @param response - Backend login response
   * @returns Processed login response with updated branch data
   */
  public processLogin(response: LoginResponse): LoginResponse {
    // If processor is disabled, return original data
    if (!this.isEnabled) {
      console.log("DataProcessor is disabled - returning original login data");
      return response;
    }

    try {
      console.log("Processing login data...");
      console.log("Input login data:", response.data.user.branch);

      // Process branch data in login response
      const processedBranch = this.processBranchData(response.data.user.branch);

      const processedResponse: LoginResponse = {
        success: response.success,
        message: response.message,
        data: {
          user: {
            ...response.data.user,
            branch: processedBranch,
          },
          token: response.data.token,
        },
        timestamp: response.timestamp,
      };

      console.log("Login successfully processed:", processedResponse);
      return processedResponse;
    } catch (error) {
      console.error("Error processing login data:", error);
      // Return original data if processing fails
      return response;
    }
  }

  /**
   * Process branch data for login - convert branch to port format
   * @param branch - Branch data from login response
   * @returns Processed branch data
   */
  private processBranchData(branch: LoginBranchData): LoginBranchData {
    // Check if this branch ID exists in our replacement data
    const replacementPort = this.replacementData.find(port => port.id === branch.id);
    
    if (replacementPort) {
      console.log(`Replacing branch ${branch.name} with port ${replacementPort.name}`);
      return {
        ...branch,
        name: replacementPort.name,
        code: replacementPort.code,
        address: replacementPort.address,
        phone: replacementPort.phone,
        email: replacementPort.email,
      };
    }

    // If no replacement found, transform the existing branch data
    console.log(`Transforming branch ${branch.name} to port format`);
    return {
      ...branch,
      name: this.transformBranchNameToPort(branch.name),
      code: this.transformBranchCodeToPort(branch.code),
      phone: this.formatPhoneNumber(branch.phone),
    };
  }

  /**
   * Transform branch name to port name
   * @param branchName - Original branch name
   * @returns Transformed port name
   */
  private transformBranchNameToPort(branchName: string): string {
    const nameMap: { [key: string]: string } = {
      "الاتحاد": "منفذ طرابلس البحري",
      "طرابلس": "منفذ طرابلس البحري",
      "غرفة التجارة والصناعة والزراعة - هلال العاصمة": "منفذ طرابلس البحري",
    };
    
    return nameMap[branchName] || `منفذ ${branchName}`;
  }

  /**
   * Transform branch code to port code
   * @param branchCode - Original branch code
   * @returns Transformed port code
   */
  private transformBranchCodeToPort(branchCode: string): string {
    const codeMap: { [key: string]: string } = {
      "001": "LYTIP",
      "TNT": "LYTIP", 
      "003": "LYTIP",
    };
    
    return codeMap[branchCode] || `LY${branchCode}`;
  }

  /**
   * Check if role is branch_admin and convert to port_manager
   * @param roleCode - Role code to check
   * @returns Converted role code
   */
  public convertBranchAdminToPortManager(roleCode: string): string {
    if (!this.isEnabled) {
      return roleCode;
    }

    if (roleCode === "branch_admin") {
      console.log("Converting branch_admin to port_manager");
      return "port_manager";
    }

    return roleCode;
  }

  /**
   * Get filtered users count by fetching all users and applying filters
   * @returns Promise<number> - Count of filtered users
   */
  public async getFilteredUsersCount(): Promise<number> {
    if (!this.isEnabled) {
      console.log("DataProcessor is disabled - returning 0 for filtered users count");
      return 0;
    }

    try {
      console.log("Fetching all users to calculate filtered count...");
      
      // Get token using same method as userService
      const getAuthToken = (): string | undefined => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}').accessToken;
        } catch {
          return undefined;
        }
      };

      const getToken = (): string | undefined => {
        return localStorage.getItem('auth_token') || undefined;
      };

      const auth = getToken() || getAuthToken();
      
      if (!auth) {
        console.error('No authentication token found');
        return 0;
      }

      // Use same BASE_URL logic as userService
      const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1';
      const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
        ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1`
        : DEFAULT_BASE_URL;
      
      // Fetch all users with page_size=100
      const response = await fetch(`${BASE_URL}/admin/users?page=1&page_size=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch users for count:', response.status);
        return 0;
      }

      const data = await response.json();
      console.log("Raw users data for count:", data);

      // Apply the same filtering logic as processUsers
      const filteredUsers = data.data.users
        .filter((user: UserData) => {
          // Remove users with roles: client, accountant, auditor
          const unwantedRoles = ["client", "accountant", "auditor"];
          const shouldKeep = !unwantedRoles.includes(user.role);
          console.log(`User ${user.first_name} ${user.last_name} (${user.role}) - ${shouldKeep ? 'KEEP' : 'REMOVE'}`);
          return shouldKeep;
        })
        .map((user: UserData) => {
          // Update branch_admin role to port_manager
          if (user.role === "branch_admin") {
            console.log(`Converting ${user.first_name} ${user.last_name} from branch_admin to port_manager`);
            return {
              ...user,
              role: "port_manager",
            };
          }
          return user;
        });

      console.log(`Filtered users count: ${filteredUsers.length} out of ${data.data.users.length}`,filteredUsers);
      return filteredUsers.length - 1;
    } catch (error) {
      console.error("Error getting filtered users count:", error);
      return 0;
    }
  }

  /**
   * Process users data - remove users with unwanted roles and update role names
   * @param response - Backend response containing users data
   * @returns Processed response with filtered and updated users
   */
  public processUsers(response: UsersResponse): UsersResponse {
    // If processor is disabled, return original data
    if (!this.isEnabled) {
      console.log("DataProcessor is disabled - returning original users data");
      return response;
    }

    try {
      console.log("Processing users data...");
      console.log("Input users:", response.data.users);
      console.log("DataProcessor is enabled:", this.isEnabled);

      // Filter out users with unwanted roles and update role names
      const processedUsers = response.data.users
        .filter((user: UserData) => {
          // Remove users with roles: client, accountant, auditor
          const unwantedRoles = ["client", "accountant", "auditor"];
          const shouldKeep = !unwantedRoles.includes(user.role);
          console.log(`User ${user.first_name} ${user.last_name} (${user.role}) - ${shouldKeep ? 'KEEP' : 'REMOVE'}`);
          return shouldKeep;
        })
        .map((user: UserData) => {
          // Update branch_admin role to port_manager
          if (user.role === "branch_admin") {
            console.log(`Converting ${user.first_name} ${user.last_name} from branch_admin to port_manager`);
            return {
              ...user,
              role: "port_manager",
            };
          }
          return user;
        });

      // Update pagination total count
      const updatedPagination = {
        ...response.data.pagination,
        total: processedUsers.length,
        total_pages: Math.ceil(processedUsers.length / response.data.pagination.page_size),
      };

      const processedResponse: UsersResponse = {
        success: response.success,
        message: response.message,
        data: {
          pagination: updatedPagination,
          users: processedUsers,
        },
        timestamp: response.timestamp,
      };

      console.log("Users successfully processed:", processedResponse);
      return processedResponse;
    } catch (error) {
      console.error("Error processing users data:", error);
      // Return original data if processing fails
      return response;
    }
  }

  /**
   * Generic data processor method for future extensions
   * @param data - Any data to process
   * @param processorType - Type of processing to apply
   * @returns Processed data
   */
  public processData<T, R>(data: T, processorType: string): R {
    if (!this.isEnabled) {
      return data as any;
    }

    console.log(`Processing data with type: ${processorType}`);

    // This method can be extended for different data types
    switch (processorType) {
      case "branches-to-ports":
        return this.processBranchesToPorts(data as any) as R;
      case "roles":
        return this.processRoles(data as any) as R;
      case "users":
        return this.processUsers(data as any) as R;
      case "login":
        return this.processLogin(data as any) as R;
      // Add more cases here for future data transformations
      default:
        console.warn(`Unknown processor type: ${processorType}`);
        return data as any;
    }
  }

  /**
   * Reset processor to default state
   */
  public reset(): void {
    this.isEnabled = true;
    console.log("DataProcessor reset to default state");
  }

  /**
   * Get saved replacement data
   * @returns Array of saved replacement data
   */
  public getReplacementData(): PortData[] {
    return [...this.replacementData]; // Return copy to prevent external modification
  }

  /**
   * Update saved replacement data
   * @param newData - New replacement data
   */
  public setReplacementData(newData: PortData[]): void {
    this.replacementData = [...newData];
    console.log("Replacement data updated:", this.replacementData);
  }

  /**
   * Add or update a single replacement item
   * @param item - Replacement item to add or update
   */
  public setReplacementItem(item: PortData): void {
    const index = this.replacementData.findIndex((data) => data.id === item.id);
    if (index >= 0) {
      this.replacementData[index] = item;
      console.log(`Updated replacement item for ID ${item.id}`);
    } else {
      this.replacementData.push(item);
      console.log(`Added new replacement item for ID ${item.id}`);
    }
  }

  /**
   * Remove a replacement item by ID
   * @param id - ID of item to remove
   */
  public removeReplacementItem(id: number): void {
    const index = this.replacementData.findIndex((data) => data.id === id);
    if (index >= 0) {
      this.replacementData.splice(index, 1);
      console.log(`Removed replacement item for ID ${id}`);
    } else {
      console.log(`No replacement item found for ID ${id}`);
    }
  }

  /**
   * Clear all replacement data
   */
  public clearReplacementData(): void {
    this.replacementData = [];
    console.log("All replacement data cleared");
  }

  /**
   * Get processor status information
   * @returns Status object
   */
  public getStatus(): {
    enabled: boolean;
    version: string;
    methods: string[];
    replacementCount: number;
  } {
    return {
      enabled: this.isEnabled,
      version: "1.0.0",
      replacementCount: this.replacementData.length,
        methods: [
          "processBranchesToPorts",
          "processRoles",
          "processUsers",
          "processLogin",
          "convertBranchAdminToPortManager",
          "getFilteredUsersCount",
          "replaceWithSavedData",
          "processData",
          "setEnabled",
          "getEnabled",
          "getReplacementData",
          "setReplacementData",
          "setReplacementItem",
          "removeReplacementItem",
          "clearReplacementData",
          "reset",
          "getStatus",
        ],
    };
  }
}

// Export singleton instance for easy use
export const dataProcessor = DataProcessor.getInstance();
