"use client";

import * as React from "react";
import {
  QrCode,
  RefreshCw,
  X,
  Sun,
  Flame,
  Volume2,
  Timer,
  Copy,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Bug,
  Moon,
  Zap,
  Battery,
  Link2,
  CreditCard,
  Landmark,
  Music,
  Instagram,
  Globe,
  MoreHorizontal,
  Check,
  Plus,
  Search,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";

// ── Mini bar chart ────────────────────────────────────────────────────────────
function MiniBar({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const max = Math.max(...values);
  return (
    <div className={`flex items-end gap-0.5 ${className ?? ""}`}>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-foreground/25"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({
  pct,
  label,
  sub,
}: {
  pct: number;
  label: string;
  sub: string;
}) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          className="text-muted/40"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          className="text-foreground"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold leading-none">{label}</span>
        <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>
      </div>
    </div>
  );
}

// ── Mini stock row ────────────────────────────────────────────────────────────
function StockRow({
  ticker,
  shares,
  value,
  bars,
}: {
  ticker: string;
  shares: string;
  value: string;
  bars: number[];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-none">{ticker}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{shares}</p>
      </div>
      <MiniBar values={bars} className="h-6 w-14" />
      <span className="text-sm font-mono font-medium w-20 text-right">
        {value}
      </span>
    </div>
  );
}

export default function UIPage() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 3, 7),
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Masonry-style columns */}
      <div style={{ columns: "310px", columnGap: "1rem" }}>
        {/* ── QR Code ────────────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="rounded-xl bg-muted p-4">
              <QrCode className="size-20 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Scan to connect your mobile device
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Open the app and scan this code to link your device.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Got it
            </Button>
          </CardContent>
        </Card>

        {/* ── Dividend Income ────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Q2 Dividend Income</CardTitle>
                <CardDescription className="mt-1">
                  Quarterly dividend payouts across your portfolio holdings.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <StockRow
                ticker="Vanguard VIG"
                shares="450 Shares"
                value="$1,842.10"
                bars={[4, 5, 3, 6, 5, 7, 6, 8, 7, 9]}
              />
              <StockRow
                ticker="S&P 500 VOO"
                shares="112 Shares"
                value="$928.40"
                bars={[3, 4, 4, 5, 3, 6, 5, 6, 7, 7]}
              />
              <StockRow
                ticker="Apple AAPL"
                shares="85 Shares"
                value="$340.00"
                bars={[2, 3, 2, 4, 3, 4, 5, 4, 6, 5]}
              />
              <StockRow
                ticker="Realty Income"
                shares="320 Shares"
                value="$1,139.50"
                bars={[5, 4, 6, 5, 7, 6, 8, 7, 9, 8]}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Dollar-Cost Averaging ──────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Dollar-Cost Averaging</CardTitle>
            <CardDescription>
              A strategy for building wealth over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Over time, this smooths out the average cost of your investments.
              When prices drop, your fixed amount buys more shares. When prices
              rise, you buy fewer. The result is a lower average cost per share
              compared to lump-sum investing during volatile periods.
            </p>
          </CardContent>
        </Card>

        {/* ── Syncing ───────────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <RefreshCw className="size-6 text-muted-foreground animate-spin" />
            <div>
              <p className="font-medium text-sm">Syncing your accounts</p>
              <p className="text-xs text-muted-foreground mt-1">
                We're pulling in your latest transactions.
                <br />
                This usually takes a few seconds.
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </CardContent>
        </Card>

        {/* ── Preferences ───────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Preferences</CardTitle>
                <CardDescription className="mt-1">
                  Manage your account settings and notifications.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">
                      USD — United States Dollar
                    </SelectItem>
                    <SelectItem value="eur">EUR — Euro</SelectItem>
                    <SelectItem value="gbp">GBP — British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Public Statistics</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow others to see your total stream count and listening
                    activity.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Monthly royalty reports and distribution updates.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">Reset</Button>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>

        {/* ── Savings Goal (donut) ───────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <DonutChart pct={80} label="$24,000" sub="80% of $30,000" />
            <Separator />
            <div className="w-full flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected Finish</span>
                <span className="font-semibold">October 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Average</span>
                <span className="font-semibold">$1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top Contributor</span>
                <span className="font-semibold">Auto-Transfer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Smart Home ────────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kitchen Island</CardTitle>
                <CardDescription>Hue Color Ambient</CardDescription>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <Tabs defaultValue="cooking">
                <TabsList className="w-full">
                  <TabsTrigger value="cooking">Cooking</TabsTrigger>
                  <TabsTrigger value="dining">Dining</TabsTrigger>
                  <TabsTrigger value="night">Nightlight</TabsTrigger>
                  <TabsTrigger value="focus">Focus</TabsTrigger>
                </TabsList>
              </Tabs>
              {[
                { label: "Brightness", icon: Sun, value: [78] },
                { label: "Color Temp", icon: Flame, value: [55] },
                { label: "Volume", icon: Volume2, value: [40] },
                { label: "Fade", icon: Timer, value: [10] },
              ].map(({ label, icon: Icon, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span>{label}</span>
                    </div>
                    <Slider defaultValue={value} max={100} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Card Balance + Payment Due (split) ───────────────────── */}
        <div className="break-inside-avoid mb-4 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-4 px-4">
              <p className="text-xs text-muted-foreground">Card Balance</p>
              <p className="text-2xl font-bold mt-1">US$12.94</p>
              <p className="text-xs text-muted-foreground mt-1">US$11,337.06</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-4 flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Payment Due</p>
                <p className="text-2xl font-bold mt-1">1 Apr</p>
              </div>
              <Button size="sm">Pay Early</Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Transfer Funds ────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Transfer Funds</CardTitle>
                <CardDescription className="mt-1">
                  Move money between your connected accounts.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Amount to Transfer</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input defaultValue="1,200.00" className="pl-6" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>From Account</Label>
                <Select defaultValue="checking">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">
                      Main Checking (··8402) — $12,450.00
                    </SelectItem>
                    <SelectItem value="savings">
                      High Yield Savings (··1192) — $42,100.00
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>To Account</Label>
                <Select defaultValue="savings">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">
                      Main Checking (··8402) — $12,450.00
                    </SelectItem>
                    <SelectItem value="savings">
                      High Yield Savings (··1192) — $42,100.00
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated arrival
                  </span>
                  <span className="font-medium">Today, Apr 14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total amount</span>
                  <span className="font-semibold">$1,200.00</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Confirm Transfer</Button>
          </CardFooter>
        </Card>

        {/* ── Power Usage ───────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Power Usage</CardTitle>
            <CardDescription>Whole Home</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <MiniBar
                values={[3, 5, 7, 6, 8, 7, 9, 10, 9, 11, 10, 12, 10, 8, 9, 8]}
                className="h-24 w-full"
              />
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Currently Using
                  </p>
                  <p className="text-xl font-bold">3.4 kW</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Solar Gen</p>
                  <p className="text-xl font-bold text-green-600">+1.2 kW</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Battery Level</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Connect Bank (empty state) ────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <Landmark className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">Connect Bank</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Link your payout method to receive monthly royalty distributions
                automatically.
              </p>
            </div>
            <Button>Set Up Payouts</Button>
          </CardContent>
        </Card>

        {/* ── Upcoming Payments / Calendar ─────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>
              Select a date to view scheduled payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        {/* ── Set Milestone ─────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Set a new milestone</CardTitle>
            <CardDescription>
              Define your financial target and we'll help you pace your savings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Goal Name</Label>
                <Input placeholder="e.g. New Car, Home Downpayment" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Target Amount</Label>
                  <Input defaultValue="$15,000" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Target Date</Label>
                  <Input defaultValue="Dec 2025" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full">Create Goal</Button>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </CardFooter>
        </Card>

        {/* ── Social Links ──────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Spotify Artist URL",
                  icon: Music,
                  placeholder: "spotify.com/artist/3j...2k",
                },
                {
                  label: "Instagram Handle",
                  icon: Instagram,
                  placeholder: "@julianduryea_music",
                },
                {
                  label: "SoundCloud URL",
                  icon: Waves,
                  placeholder: "soundcloud.com/username",
                },
                {
                  label: "Website",
                  icon: Globe,
                  placeholder: "https://yoursite.com",
                },
              ].map(({ label, icon: Icon, placeholder }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <Label>{label}</Label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input placeholder={placeholder} className="pl-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost">Discard</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* ── Invite Team ───────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Invite Team</CardTitle>
            <CardDescription>Add members to your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {["alex@example.com", "sam@example.com"].map((email, i) => (
                <div key={email} className="flex gap-2">
                  <Input defaultValue={email} className="flex-1" />
                  <Select defaultValue={i === 0 ? "editor" : "viewer"}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button variant="outline" size="sm">
                <Plus />
                Add another
              </Button>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <Label>Or share invite link</Label>
                <div className="flex gap-2">
                  <Input
                    defaultValue="https://app.co/invite/x8f2k"
                    readOnly
                    className="flex-1 text-muted-foreground"
                  />
                  <Button variant="outline" size="icon">
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Send Invites</Button>
          </CardFooter>
        </Card>

        {/* ── Shipping Address ──────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>Where should we deliver?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Street address</Label>
                <Input defaultValue="123 Main Street" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Apt / Suite</Label>
                <Input defaultValue="Apt 4B" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>City</Label>
                  <Input defaultValue="San Francisco" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>State</Label>
                  <Select defaultValue="ca">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ca">California</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                      <SelectItem value="tx">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>ZIP Code</Label>
                  <Input defaultValue="94102" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Country</Label>
                  <Select defaultValue="us">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="gb">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="default-addr" defaultChecked />
                <Label htmlFor="default-addr">Save as default address</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost">Cancel</Button>
            <Button>Save Address</Button>
          </CardFooter>
        </Card>

        {/* ── Book Appointment ──────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>Dr. Sarah Chen · Cardiology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium">Available on March 18, 2026</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["9:00 AM", "10:30 AM", "11:00 AM", "1:30 PM"].map((t) => (
                  <Button
                    key={t}
                    variant={t === "10:30 AM" ? "default" : "outline"}
                    size="sm"
                    className="text-xs px-2"
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-lg border p-3">
                <Checkbox id="new-patient" />
                <div>
                  <Label htmlFor="new-patient" className="text-sm font-medium">
                    New patient?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Please arrive 15 minutes early.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Book Appointment</Button>
          </CardFooter>
        </Card>

        {/* ── Report Bug ────────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Report Bug</CardTitle>
            <CardDescription>Help us fix issues faster.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Title</Label>
                <Input placeholder="Brief description of the issue" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Severity</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Component</Label>
                  <Select defaultValue="dashboard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="auth">Auth</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Steps to reproduce</Label>
                <Textarea
                  placeholder="1. Go to 2. Click on 3. Observe…"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">Attach File</Button>
            <Button>Submit Bug</Button>
          </CardFooter>
        </Card>

        {/* ── Profile ───────────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label>Name</Label>
                <Input defaultValue="shadcn" />
                <p className="text-xs text-muted-foreground mt-1">
                  Your name may appear around the app where you contribute or
                  are mentioned.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Public Email</Label>
                <Select defaultValue="main">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">m@shadcn.com</SelectItem>
                    <SelectItem value="work">work@shadcn.com</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  You can manage verified email addresses in your email
                  settings.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Bio</Label>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can @mention other users and organizations to link to
                  them.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Profile</Button>
          </CardFooter>
        </Card>

        {/* ── No Team Members (empty state) ─────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex -space-x-2">
              {["A", "B", "C"].map((l) => (
                <Avatar key={l} className="size-8 border-2 border-background">
                  <AvatarFallback className="text-xs">{l}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <p className="font-semibold text-sm">No Team Members</p>
              <p className="text-xs text-muted-foreground mt-1">
                Invite your team to collaborate on this project.
              </p>
            </div>
            <Button size="sm">Invite Members</Button>
          </CardContent>
        </Card>

        {/* ── Sleep Report ──────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Sleep Report</CardTitle>
            <CardDescription>Last night · 7h 24m</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <MiniBar
                values={[4, 6, 8, 9, 7, 8, 10, 9, 7, 8, 6, 5, 7, 8, 9, 8]}
                className="h-20 w-full"
              />
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { label: "Deep", val: "2h 10m" },
                  { label: "Light", val: "3h 48m" },
                  { label: "REM", val: "1h 26m" },
                  { label: "Score", val: "84" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-semibold text-sm">{s.val}</p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <Badge variant="secondary">Good</Badge>
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Feedback ──────────────────────────────────────────────── */}
        <Card className="break-inside-avoid mb-4">
          <CardHeader>
            <CardTitle>Share feedback</CardTitle>
            <CardDescription>Your feedback helps us improve.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Your feedback helps us improve…" rows={4} />
          </CardContent>
          <CardFooter className="justify-end">
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
