"use client";

import { useState, useEffect } from "react";
import { UserProfile as UserProfileType } from "@/types/health-metrics";
import { getUserReferralData, saveReferralData } from "@/app/actions/referral-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Copy, Check, Users } from "lucide-react";
import { generateReferralCode, createReferralLink } from "@/lib/referral-utils";
import { toast } from "sonner";

interface ReferralSectionProps {
  userId: string;
  profile?: UserProfileType | null; // Make profile optional
  onUpdateProfile?: (profile: UserProfileType) => void; // Make onUpdateProfile optional
}

export function ReferralSection({ userId, profile, onUpdateProfile }: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<{
    referralCode: string;
    referralCount: number;
    referrals: string[];
    referredBy?: string;
  }>({ 
    referralCode: profile?.referralCode || "", 
    referralCount: profile?.referralCount || 0,
    referrals: profile?.referrals || [],
    referredBy: profile?.referredBy
  });
  
  // Load referral data on component mount
  useEffect(() => {
    const loadReferralData = async () => {
      if (userId) {
        const data = await getUserReferralData(userId);
        if (data) {
          setReferralData(data);
        } else if (profile?.referralCode) {
          // Fallback to profile data if available
          setReferralData({
            referralCode: profile.referralCode,
            referralCount: profile.referralCount || 0,
            referrals: profile.referrals || [],
            referredBy: profile.referredBy
          });
        }
      }
    };
    
    loadReferralData();
  }, [userId, profile]);
  
  // Generate a referral code if one doesn't exist
  const ensureReferralCode = async () => {
    if (!referralData.referralCode && userId) {
      const newCode = generateReferralCode();
      const updatedData = {
        ...referralData,
        referralCode: newCode,
        referralCount: 0,
        referrals: []
      };
      
      // Save the new referral data
      await saveReferralData(userId, updatedData);
      setReferralData(updatedData);
      
      // Also update profile if onUpdateProfile is provided
      if (profile && onUpdateProfile) {
        const newProfile = { ...profile };
        newProfile.referralCode = newCode;
        newProfile.referralCount = 0;
        newProfile.referrals = [];
        onUpdateProfile(newProfile);
      }
    }
  };
  
  // Make sure we have a referral code
  useEffect(() => {
    if (!referralData.referralCode && userId) {
      ensureReferralCode();
    }
  }, [referralData.referralCode, userId]);
  
  const referralCode = referralData.referralCode || "";
  const referralLink = referralCode ? createReferralLink(referralCode) : "";
  const referralCount = referralData.referralCount || 0;
  
  // Copy referral link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  
  // Share referral link
  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on the Health Tracker App!",
          text: "I'm using this amazing health tracking app. Join me with my referral link!",
          url: referralLink,
        });
      } catch (err) {
        console.error("Error sharing: ", err);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
    }
  };
  
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span>Referrals</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Share your unique referral link with friends and track your referrals!
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <Input 
                value={referralLink}
                readOnly
                className="bg-white"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button
              variant="default"
              className="w-full mt-3"
              onClick={shareReferralLink}
            >
              <Share className="h-4 w-4 mr-2" />
              Share Your Link
            </Button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Your Referral Code</div>
            <div className="font-medium text-lg tracking-wider">{referralCode}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Successful Referrals</div>
            <div className="font-medium text-lg">{referralCount}</div>
          </div>
          
          {referralData.referredBy && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">You were referred by</div>
              <div className="font-medium">{referralData.referredBy}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
