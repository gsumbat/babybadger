// GENERATED from wireframe S6c-CalMonth.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2.6; stroke-linecap: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Sitter calendar · Month */
export default function WF_S6c() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 20, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexShrink: 1 }}>Calendar</Text>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S11-Availability.dc.html */}
            <SvgXml xml={SVG[0]} width={16} height={16} />
            <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>Time off</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Day</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6-Calendar.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Week</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6c-CalMonth.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328" }}>Month</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>October 2026</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>29 shifts · 2 families · 2 requests</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column" }}>
          <View style={{ flexDirection: "row", gap: 0 }}>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>M</Text></View>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>T</Text></View>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>W</Text></View>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>T</Text></View>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>F</Text></View>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>S</Text></View>
            <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>S</Text></View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "column", alignItems: "center", height: 54, paddingTop: 6, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#B4BEC2" }}>28</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", height: 54, paddingTop: 6, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#B4BEC2" }}>29</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", height: 54, paddingTop: 6, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#B4BEC2" }}>30</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#47698A", borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>1</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column", ...cardShadow }}>
                </View>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column", ...cardShadow }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>2</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>3</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#FFFFFF", borderRadius: 4, borderWidth: 1.5, borderColor: "#B7791F", flexShrink: 1, flexDirection: "column" }}>
                </View>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#5F6D74" }}>4</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>5</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>6</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>7</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>8</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>9</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>10</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>11</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>12</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>13</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>14</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>15</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>16</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#5F6D74" }}>17</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#5F6D74" }}>18</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>19</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>20</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>21</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>22</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>23</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>24</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#FFFFFF", borderRadius: 4, borderWidth: 1.5, borderColor: "#B7791F", flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>25</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>26</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>27</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>28</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>29</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>30</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#2F6FD6", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 6, height: 54, paddingTop: 6, backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1.0, borderColor: "#EEF1F4", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>31</Text>
              <View style={{ flexDirection: "row", gap: 3 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#D9822B", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", height: 54, paddingTop: 6, borderRadius: 10, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 14, color: "#B4BEC2" }}>1</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 9, height: 9, backgroundColor: "#2F6FD6", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Lee</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 9, height: 9, backgroundColor: "#D9822B", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Ortiz</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 2.0, borderColor: "#B7791F", flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Request</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 12, height: 9, borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Off</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 14, paddingBottom: 4, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> S20-ShiftRequest.dc.html */}
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>2 requests need an answer</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", flexShrink: 1 }}>Review ›</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>{/* -> S7-Pay.dc.html */}
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>October so far · [HOURS]</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#47698A", flexShrink: 1 }}>Pay ›</Text>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
