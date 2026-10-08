// GENERATED from wireframe S17d-BackgroundUpload.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"></path><path d=\"M8.5 12l2.5 2.5 4.5-4.5\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M7 3h7l4 4v14H7z\"></path><path d=\"M14 3v4h4M10 12h5M10 16h5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M7 3h7l4 4v14H7z\"></path><path d=\"M14 3v4h4M10 12h5M10 16h5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 16V4M7 9l5-5 5 5\"></path><path d=\"M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"></circle><path d=\"M20 20l-4.2-4.2\"></path></svg>"
];

/** Background check · upload */
export default function WF_S17d() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S14-Credentials.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Background check</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F6E3C6", borderRadius: 14 }}>{/* -> S53-Requests.dc.html */}
          <SvgXml xml={SVG[1]} width={22} height={22} />
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20, flexGrow: 1, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#7A4E0E", lineHeight: 20 }}>The Lee family asked for one.</Text> Any check from the last 12 months.</Text>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>UPLOAD A REPORT I HAVE</Text>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12, borderRadius: 14, borderWidth: 2.0, borderColor: "#C9D3DD", borderStyle: "dashed" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 56, height: 40, flexShrink: 0, borderRadius: 6, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
              <SvgXml xml={SVG[2]} width={22} height={22} />
            </View>
            <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>background-report.pdf</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#1B6B3D" }}>Ready to upload</Text>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#47698A", textDecorationLine: "underline", flexShrink: 1 }}>Replace</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
              <SvgXml xml={SVG[3]} width={18} height={18} />
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>PDF</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, flexGrow: 1, flexBasis: 0, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>
              <SvgXml xml={SVG[4]} width={18} height={18} />
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Photo</Text>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 6, minWidth: 0, flexGrow: 1, flexBasis: 0 }}>
            <View style={{}}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Who ran it</Text></View>
            <TextInput placeholder="" defaultValue="Checkr" placeholderTextColor="#6B7980" style={{ height: 48, minWidth: 0, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5", fontFamily: font.body, fontSize: 16, color: "#1B2328" }} />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flexDirection: "column", gap: 6, minWidth: 0, flexGrow: 1, flexBasis: 0, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Date of the report</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
                <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>08/12/2026</Text>
                <SvgXml xml={SVG[5]} width={18} height={18} />
              </View>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>RUN ONE IN THE APP</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, opacity: 0.55, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 14 }}>
            <SvgXml xml={SVG[6]} width={22} height={22} />
          </View>
          <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Run a check with BabyBadger</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Through a partner, with your OK</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Coming soon</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Only you see your report. A family sees it only when you share it with them.</Text>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 4, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> S53-Requests.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save and share with the Lee family</Text>
        </View>
      </View>
    </View>
  );
}
