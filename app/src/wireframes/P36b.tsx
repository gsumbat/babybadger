// GENERATED from wireframe P36b-PlansResubscribe.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round\"><path d=\"M6 6l12 12M18 6L6 18\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z\"></path><path d=\"M9 4v13.5M15 6.5V20\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"6\" cy=\"18\" r=\"2.5\"></circle><circle cx=\"18\" cy=\"6\" r=\"2.5\"></circle><path d=\"M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3h8l4 4v14H6z\"></path><path d=\"M14 3v4h4M9 12h6M9 16h6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><rect x=\"7\" y=\"2.5\" width=\"10\" height=\"19\" rx=\"2.5\"></rect><path d=\"M11 18.5h2\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"9\" cy=\"8\" r=\"3.5\"></circle><path d=\"M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7\"></path></svg>"
];

/** Plans resubscribe */
export default function WF_P36b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingTop: 16, paddingRight: 20, paddingBottom: 0, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P39-Subscription.dc.html */}
          <SvgXml xml={SVG[0]} width={18} height={18} />
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", lineHeight: 34 }}>Know they’re okay, every shift</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960" }}>One plan for your household. Cancel anytime.</Text>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 6, paddingRight: 14, paddingBottom: 6, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[1]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Live map while the sitter is on shift</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Trips with arrival alerts</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[3]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Care plan and shift reports</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[4]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Kids’ phones and tablets</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
              <SvgXml xml={SVG[5]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Both parents, unlimited sitters</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Sitters always use BabyBadger free</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 16, borderWidth: 2.0, borderColor: "#47698A" }}>
          <View style={{ flexDirection: "row", alignItems: "center", height: 22, top: -11, right: 12, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8B9BE", borderRadius: 999, position: "absolute", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#1B2328" }}>SAVE 20%</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#47698A" }}>
            <View style={{ width: 10, height: 10, backgroundColor: "#47698A", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>Yearly</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "rgb(75, 89, 96)" }}>Works out to $9.99/mo</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "flex-end", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -5.02 }}>$119.88</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "rgb(75, 89, 96)" }}>per year</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 11, borderWidth: 2.0, borderColor: "#C3CCD5", flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#1B2328" }}>Monthly</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Flexible, cancel anytime</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "flex-end", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -5.02 }}>$11.99</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "rgb(75, 89, 96)" }}>per month</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 6, paddingTop: 6, paddingRight: 20, paddingBottom: 26, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P37-Purchase.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Subscribe</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 16, textAlign: "center" }}>$119.88/year, starting today. Cancel anytime in Settings.</Text>
      </View>
    </View>
  );
}
