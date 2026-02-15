// pages/settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Loader2,
  Key,
  Download,
  QrCode,
  Instagram,
  Facebook,
  Copy,
  Check
} from 'lucide-react';
import { get, post } from '../../utils/service';
import { toast } from 'sonner';
import Drawer from '../../components/ui/drawer';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { assets } from '@/assets/assets';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  
  const [showPasswordDrawer, setShowPasswordDrawer] = useState(false);
  const [expProgress, setExpProgress] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    name: "",
    email: "",
    role: "",
  });

  const [socialLinks, setSocialLinks] = useState({
    instagram: "hotelhorizonug",
    facebook: "hotelhorizonuganda",
    tiktok: "@hotelhorizonug",
    website: "https://hotelhorizonug.com"
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setExpProgress((prev) => {
          if (prev >= 78) {
            clearInterval(interval);
            return 78;
          }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const generateQRCode = async () => {
      setIsGeneratingQR(true);
      try {
        const url = await QRCode.toDataURL("https://hotelhorizonug.com", {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsGeneratingQR(false);
      }
    };

    generateQRCode();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await get<{
        success: boolean;
        message: string;
        data: UserProfile;
      }>("/auth/me");

      if (response.success) {
        setProfile(response.data);
      } else {
        toast.error("Failed to fetch profile");
      }
    } catch (error: any) {
      toast.error("Failed to fetch profile");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    toast.success("Social links saved successfully");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const response = await post<{
        success: boolean;
        message: string;
      }>(`/users/${profile.id}/change-password`, {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });

      if (response.success) {
        toast.success("Password changed successfully");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordDrawer(false);
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const downloadAsPNG = async () => {
    if (!qrCodeRef.current) return;

    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `hotelhorizon-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Error downloading PNG:", error);
    }
  };

  const downloadAsJPEG = async () => {
    if (!qrCodeRef.current) return;

    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const jpegUrl = canvas.toDataURL("image/jpeg", 0.9);
      const downloadLink = document.createElement("a");
      downloadLink.href = jpegUrl;
      downloadLink.download = `hotelhorizon-qr.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Error downloading JPEG:", error);
    }
  };

  const downloadAsPDF = async () => {
    if (!qrCodeRef.current) return;

    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 100;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20;

      pdf.addImage(imgData, "PNG", 50, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      pdf.setFontSize(16);
      pdf.text("Hotel Horizon Uganda", 105, 15, { align: "center" });
      pdf.setFontSize(12);
      pdf.text("https://hotelhorizonug.com", 20, 150);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 160);

      pdf.save(`hotelhorizon-qr.pdf`);
      setShowDownloadMenu(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const copyToClipboard = (text: string, linkName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(linkName);
    toast.success(`${linkName} link copied!`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getFullUrl = (platform: string, handle: string) => {
    switch(platform) {
      case 'instagram':
        return `https://instagram.com/${handle}`;
      case 'facebook':
        return `https://facebook.com/${handle}`;
      case 'tiktok':
        return `https://tiktok.com/${handle}`;
      default:
        return handle;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-32 mb-2 animate-pulse`}></div>
          <div className={`h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-48 animate-pulse`}></div>
        </div>
        <div className={`h-64 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl mb-6 animate-pulse`}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl">
          <div className="relative h-[250px] overflow-hidden rounded-t-xl">
            <img
              src={assets.SettingImg}
              alt="Hotel Horizon"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="-mt-12 px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 overflow-hidden bg-primary flex items-center justify-center text-white">
                  <User className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* <div className="mb-8">
              <h2 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.email}</p>
              <span className={`inline-block mt-2 px-2 py-1 bg-secondary/20 text-primary text-xs rounded-full capitalize`}>
                {profile.role}
              </span>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <div className="h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <QrCode className="w-4 h-4" />
                      Hotel Horizon QR
                    </h3>
                    <div className="relative">
                      <button
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                        className="p-1.5 bg-primary flex gap-2 rounded-md transition-colors text-xs text-white"
                      >
                        Share
                        <Download className="w-4 h-4" />
                      </button>

                      {showDownloadMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDownloadMenu(false)}
                          />
                          <div className={`absolute right-0 mt-1 w-48 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-50`}>
                            <button
                              onClick={downloadAsPNG}
                              className={`w-full text-left px-4 py-2 text-xs ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} flex items-center gap-2`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download as PNG
                            </button>
                            <button
                              onClick={downloadAsJPEG}
                              className={`w-full text-left px-4 py-2 text-xs ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} flex items-center gap-2`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download as JPEG
                            </button>
                            <button
                              onClick={downloadAsPDF}
                              className={`w-full text-left px-4 py-2 text-xs ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} flex items-center gap-2`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download as PDF
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative pr-4 md:pr-6" ref={qrCodeRef}>
                    <div className={`absolute right-0 top-0 bottom-0 w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} hidden md:block`}></div>

                    {isGeneratingQR ? (
                      <div className="w-full h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : qrCodeUrl ? (
                      <div className="text-center">
                        <div className="inline-block relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                          <img
                            src={qrCodeUrl}
                            alt="Hotel Horizon QR Code"
                            className="w-full h-auto max-w-[180px] mx-auto"
                          />
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>hotelhorizonug.com</p>
                      </div>
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          QR Code not available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <User className="w-4 h-4" />
                      Profile Details
                    </h3>
                    <button
                      onClick={() => setShowPasswordDrawer(true)}
                      className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      Change Password
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Full Name</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.name}</p>
                      </div>

                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Email Address</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{profile.email}</p>
                      </div>

                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Role</p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize`}>{profile.role}</p>
                      </div>
                    </div>

                    {/* Social Media Icons with Copy Links */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>Share Social Links</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => copyToClipboard(getFullUrl('instagram', socialLinks.instagram), 'Instagram')}
                          className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white hover:opacity-90 transition-opacity"
                        >
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            <span className="text-xs">Instagram</span>
                          </div>
                          {copiedLink === 'Instagram' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => copyToClipboard(getFullUrl('facebook', socialLinks.facebook), 'Facebook')}
                          className="flex items-center justify-between p-2 bg-blue-600 rounded-lg text-white hover:opacity-90 transition-opacity"
                        >
                          <div className="flex items-center gap-2">
                            <Facebook className="w-4 h-4" />
                            <span className="text-xs">Facebook</span>
                          </div>
                          {copiedLink === 'Facebook' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>

                        <button
                          onClick={() => copyToClipboard(getFullUrl('tiktok', socialLinks.tiktok), 'TikTok')}
                          className="flex items-center justify-between p-2 bg-black rounded-lg text-white hover:opacity-90 transition-opacity"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                            </svg>
                            <span className="text-xs">TikTok</span>
                          </div>
                          {copiedLink === 'TikTok' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className={`mt-6 p-4 ${isDarkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-primary border-secondary'} rounded-lg border mb-6`}>
              <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-white'}`}>About Your QR Code:</p>
              <ul className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-white'} space-y-1`}>
                <li>• Scan this QR code to visit Hotel Horizon Uganda website</li>
                <li>• Share with guests for easy access to your hotel website</li>
                <li>• Download in PNG, JPEG, or PDF format</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Drawer */}
      <Drawer
        isOpen={showPasswordDrawer}
        onClose={() => {
          setShowPasswordDrawer(false);
          resetPasswordForm();
        }}
        title="Change Password"
        position="right"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 p-4">
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent`}
              required
              minLength={6}
            />
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Minimum 6 characters</p>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent`}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowPasswordDrawer(false);
                resetPasswordForm();
              }}
              className={`flex-1 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} py-3 rounded-lg text-xs font-medium transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-secondary text-primary py-3 rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default SettingsPage;