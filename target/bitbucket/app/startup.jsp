<%@ page import="com.atlassian.bitbucket.Product" %>
<%@ page import="com.atlassian.bitbucket.util.Progress" %>
<%@ page import="com.atlassian.stash.internal.lifecycle.StartupManager" %>
<!DOCTYPE html>
<html>
<%
    ServletContext servletContext = pageContext.getServletContext();
    StartupManager startupManager = (StartupManager) request.getAttribute("startupManager");
    Progress progress = startupManager.getProgress();
%>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=EDGE">
    <title><%= Product.FULL_NAME %> - Starting</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            background-color: #F4F5F7;
            color: #172B4D;
            text-align: center;
            margin-top: 90px;
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
            font-size: 18px;
            line-height: 1.3;
        }

        h1 {
            font-weight:normal;
            font-size: 32px;
            margin: 0;
        }

        .bitbucket-logo {
            width: 63px;
            height: 61px;
            margin: 0 auto 30px;
            overflow: hidden;
        }

        .header {
            border-bottom: 1px solid #DFE1E6;
            padding: 0 0 30px;
            margin: 0 0 30px;
        }

        .message {
            font-size: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            white-space: nowrap;
            text-align: left;
        }

        .section {
            width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border: none;
            border-radius: 3px;
            box-shadow: 0 1px 1px rgba(9, 30, 66, 0.13), 0 0 1px 0 rgba(9, 30, 66, 0.25);
            padding: 30px 40px;
            text-align: center;
        }

        .progress-bar {
            width: 100%;
            background-color: #DFE1E6;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin: 0 0 20px;
            position: relative;
        }

        .progress-indicator {
            display: block;
            background-color: #0052CC;
            height: 100%;
            color: #fff;
            transition:width 0.2s ease-in-out;
        }

        .progress-indicator.unknown {
            width: 100%;
            -webkit-animation: progressSlide 1s infinite linear;
            animation: progressSlide 1s infinite linear;
            background: 0 0;
            background-color: transparent;
            background-size: 20px 5px;
            background-image: linear-gradient(90deg, #ccc 50%, transparent 50%, transparent 100%);
            border-radius: 3px;
            display: block;
            height: 5px;
            -webkit-transform: skewX(45deg);
            transform: skewX(45deg);
            position: absolute;
            width: 100%
        }
        @-webkit-keyframes progressSlide {
            0% { background-position: 20px }
            100% { background-position: 0 }
        }

        @keyframes progressSlide {
            0% { background-position: 20px }
            100% { background-position: 0 }
        }

        footer {
            width: 600px;
            margin: 30px auto;
        }

        footer .logo {
            display: block;
            height: 24px; /* match image height */
            margin: 30px auto;
            text-align: left;
            text-indent: -9999em;
            width: 127px; /* match image width */
            background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEyN3B4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAxMjcgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0Ni4yICg0NDQ5NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+PHRpdGxlPkF0bGFzc2lhbiBob3Jpem9udGFsIG5ldXRyYWwgZ3JhZGllbnQgLSBzbWFsbDwvdGl0bGU+PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSI5OS42NzQ4ODk2JSIgeTE9IjE1LjgxNzY4NSUiIHgyPSI0NC42NTY3NzMyJSIgeTI9IjkwLjg3Njc5MDElIiBpZD0ibGluZWFyR3JhZGllbnQtMSI+PHN0b3Agc3RvcC1jb2xvcj0iIzUwNUY3OSIgb2Zmc2V0PSIwJSI+PC9zdG9wPjxzdG9wIHN0b3AtY29sb3I9IiM3QTg2OUEiIG9mZnNldD0iMTAwJSI+PC9zdG9wPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxnIGlkPSIyNHB4LUhvcml6b250YWwtKHNtYWxsKSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGcgaWQ9IkF0bGFzc2lhbi1ob3Jpem9udGFsLW5ldXRyYWwtZ3JhZGllbnQtLS1zbWFsbCIgZmlsbC1ydWxlPSJub256ZXJvIj48ZyBpZD0iQXRsYXNzaWFuLWhvcml6b250YWwtd2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCA0LjAwMDAwMCkiPjxwYXRoIGQ9Ik00LjYwMzM1MDcsNy43NDE1NDYyIEM0LjUwOTU3NTg4LDcuNjIwMTQyNiA0LjM1ODQ4NjksNy41NTYwNTY0IDQuMjA0OTUwNTksNy41NzI1NjAwMyBDNC4wNTE0MTQyNyw3LjU4OTA2MzY1IDMuOTE3NzYyLDcuNjgzNzU2NjkgMy44NTI1Mjg2LDcuODIyMjUyMDggTDAuMDQ3OTk4NjM5OSwxNS4zNDc4OTkxIEMtMC4wMjI0NzA0Mjk5LDE1LjQ4NzM1MDYgLTAuMDE0OTM3NTg4NCwxNS42NTI5NTcyIDAuMDY3OTA3Mjc3NywxNS43ODU1ODI3IEMwLjE1MDc1MjE0NCwxNS45MTgyMDgzIDAuMjk3MDk3MDYzLDE1Ljk5ODk0MzIgMC40NTQ2ODQwMzMsMTUuOTk4OTU4IEw1Ljc1MjI5NjM5LDE1Ljk5ODk1OCBDNS45MjU2NDg0MSwxNi4wMDI5Mzk3IDYuMDg1MDc3NjYsMTUuOTA1NDQxOCA2LjE1ODk4MTc5LDE1Ljc1MDI1MjEgQzcuMzAxNzQzOTYsMTMuNDE0MDE2OCA2LjYwOTE4OTY1LDkuODYxNzgxNDkgNC42MDMzNTA3LDcuNzQxNTQ2MiBaIiBpZD0iU2hhcGUiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMSkiPjwvcGF0aD48cGF0aCBkPSJNNy4zOTA2MzcwNSwwLjg5MTQyMzkxMyBDNS40NjIwNjU1MywzLjgyNzI2NTQ4IDUuMjM5NDc5MDEsNy41NTExNjU4NSA2LjgwNDg2NzM5LDEwLjY5MTQyMzkgTDkuMzU4ODk5MjIsMTUuNzQ1MDcxIEM5LjQzNTkxNTkyLDE1Ljg5NzQ3OTYgOS41OTMzNTU0NiwxNS45OTM3NjA3IDkuNzY1NTg0NjIsMTUuOTkzNzc2OSBMMTUuMDYyMjQ1NywxNS45OTM3NzY5IEMxNS4yMTk4MzI2LDE1Ljk5Mzc2MjEgMTUuMzY2MTc3NiwxNS45MTMwMjcyIDE1LjQ0OTAyMjQsMTUuNzgwNDAxNiBDMTUuNTMxODY3MywxNS42NDc3NzYxIDE1LjUzOTQwMDEsMTUuNDgyMTY5NSAxNS40Njg5MzExLDE1LjM0MjcxOCBDMTUuNDY4OTMxMSwxNS4zNDI3MTggOC4zNDMxMzcwNSwxLjI0MTMwNjI3IDguMTY0MDUyNzgsMC44ODg2MDAzODQgQzguMDkxODAyMTcsMC43NDIxMDAxNzIgNy45NDEyMTI1NSwwLjY0OTQwMTUwMSA3Ljc3NjQ0OTc0LDAuNjUwMDAzMDA1IEM3LjYxMTY4NjkyLDAuNjUwNjA0NTA5IDcuNDYxNzkyODksMC43NDQ0MDAxNjQgNy4zOTA2MzcwNSwwLjg5MTQyMzkxMyBMNy4zOTA2MzcwNSwwLjg5MTQyMzkxMyBaIiBpZD0iU2hhcGUiIGZpbGw9IiM3QTg2OUEiPjwvcGF0aD48cGF0aCBkPSJNNjkuNTE4MjY2OSw2LjkyNzk1NDQxIEM2OS41MTgyNjY5LDguNzkxNDgzODIgNzAuMzkyMDQ1OSwxMC4yNzEwMTMyIDczLjgwOTg2OCwxMC45MjQxODk3IEM3NS44NDkwMDI4LDExLjM0NzcxOTEgNzYuMjc2MTQxNCwxMS42NzMzNjYyIDc2LjI3NjE0MTQsMTIuMzQ1ODM2OCBDNzYuMjc2MTQxNCwxMi45OTkwMTMyIDc1Ljg0ODA1MTUsMTMuNDIxODM2OCA3NC40MTE4MDk5LDEzLjQyMTgzNjggQzcyLjY3NTkzMSwxMy4zOTA5NTg2IDcwLjk3NDc1NjgsMTIuOTM1NTM4IDY5LjQ1OTk5OTEsMTIuMDk2MTg5NyBMNjkuNDU5OTk5MSwxNS4xMzE0ODM4IEM3MC40ODkzMTc0LDE1LjYzMTAxMzIgNzEuODQ4NTAyOCwxNi4xODgxODk3IDc0LjM3MzA0NCwxNi4xODgxODk3IEM3Ny45NDYxNjc2LDE2LjE4ODE4OTcgNzkuMzYzODU4NiwxNC42MTE3MTkxIDc5LjM2Mzg1ODYsMTIuMjY4ODk1NiBNNzkuMzYzODU4NiwxMi4yNjg4OTU2IEM3OS4zNjM4NTg2LDEwLjA1OTQ4MzggNzguMTc5MjM4OCw5LjAyMTgzNjc2IDc0LjgzOTE4NjQsOC4zMTEyNDg1MyBDNzIuOTk0MzU2OCw3LjkwNzcxOTEyIDcyLjU0NzcxNjMsNy41MDQ0MjUgNzIuNTQ3NzE2Myw2LjkyNzk1NDQxIEM3Mi41NDc3MTYzLDYuMTk4NTQyNjUgNzMuMjA3OTI2MSw1Ljg5MDU0MjY1IDc0LjQzMTMxMTgsNS44OTA1NDI2NSBDNzUuOTA3MjcwNiw1Ljg5MDU0MjY1IDc3LjM2MzcyNzUsNi4zMzI0MjUgNzguNzQyNDE0OCw2Ljk0NzI0ODUzIEw3OC43NDI0MTQ4LDQuMDQ2MDcyMDYgQzc3LjQyMDQwOTksMy40NTA3NjkzNyA3NS45ODA2MDM5LDMuMTU1NDA4NzkgNzQuNTI4MzQ1NSwzLjE4MTYwMTQ3IEM3MS4yMjcwNTksMy4xODE2MDE0NyA2OS41MTgyNjY5LDQuNjAzMjQ4NTMgNjkuNTE4MjY2OSw2LjkyNzk1NDQxIiBpZD0iU2hhcGUiIGZpbGw9IiM1MDVGNzkiPjwvcGF0aD48cG9seWdvbiBpZD0iU2hhcGUiIGZpbGw9IiM1MDVGNzkiIHBvaW50cz0iMTE1LjQxOTk5OCAzLjM4MDAwMDExIDExNS40MTk5OTggMTYuMDAyNTg4MyAxMTguMTM4NjA3IDE2LjAwMjU4ODMgMTE4LjEzODYwNyA2LjM3NzE3NjU5IDExOS4yODQ0NjEgOC45MzIyMzU0MSAxMjMuMTI5NDIxIDE2LjAwMjU4ODMgMTI2LjU0NzI0MyAxNi4wMDI1ODgzIDEyNi41NDcyNDMgMy4zODAwMDAxMSAxMjMuODI4NjM1IDMuMzgwMDAwMTEgMTIzLjgyODYzNSAxMS41MjYxMTc4IDEyMi43OTkzMTcgOS4xNjI4MjM2NCAxMTkuNzExNTk5IDMuMzgwMDAwMTEiPjwvcG9seWdvbj48cmVjdCBpZD0iUmVjdGFuZ2xlLXBhdGgiIGZpbGw9IiM1MDVGNzkiIHg9Ijk1LjE2MDAwMzciIHk9IjMuMzgwMDAwMTEiIHdpZHRoPSIyLjk3MTE4MTY1IiBoZWlnaHQ9IjEyLjYyMjU4ODIiPjwvcmVjdD48cGF0aCBkPSJNOTEuNzMzODYxNCwxMi4yNjg4OTU2IEM5MS43MzM4NjE0LDEwLjA1OTQ4MzggOTAuNTQ5MjQxNSw5LjAyMTgzNjc2IDg3LjIwOTE4OTEsOC4zMTEyNDg1MyBDODUuMzY0MzU5NSw3LjkwNzcxOTEyIDg0LjkxNzcxOTEsNy41MDQ0MjUgODQuOTE3NzE5MSw2LjkyNzk1NDQxIEM4NC45MTc3MTkxLDYuMTk4NTQyNjUgODUuNTc3OTI4OCw1Ljg5MDU0MjY1IDg2LjgwMTMxNDYsNS44OTA1NDI2NSBDODguMjc3MjczNCw1Ljg5MDU0MjY1IDg5LjczMzczMDMsNi4zMzI0MjUgOTEuMTEyNDE3Niw2Ljk0NzI0ODUzIEw5MS4xMTI0MTc2LDQuMDQ2MDcyMDYgQzg5Ljc5MDQxMjYsMy40NTA3NjkzNyA4OC4zNTA2MDY2LDMuMTU1NDA4NzkgODYuODk4MzQ4MywzLjE4MTYwMTQ3IEM4My41OTcwNjE4LDMuMTgxNjAxNDcgODEuODg4MjY5Niw0LjYwMzI0ODUzIDgxLjg4ODI2OTYsNi45Mjc5NTQ0MSBDODEuODg4MjY5Niw4Ljc5MTQ4MzgyIDgyLjc2MjA0ODYsMTAuMjcxMDEzMiA4Ni4xNzk4NzA3LDEwLjkyNDE4OTcgQzg4LjIxOTAwNTYsMTEuMzQ3NzE5MSA4OC42NDYxNDQyLDExLjY3MzM2NjIgODguNjQ2MTQ0MiwxMi4zNDU4MzY4IEM4OC42NDYxNDQyLDEyLjk5OTAxMzIgODguMjE4MDU0MywxMy40MjE4MzY4IDg2Ljc4MTgxMjcsMTMuNDIxODM2OCBDODUuMDQ1OTMzNywxMy4zOTA5NTg2IDgzLjM0NDc1OTUsMTIuOTM1NTM4IDgxLjgzMDAwMTgsMTIuMDk2MTg5NyBMODEuODMwMDAxOCwxNS4xMzE0ODM4IEM4Mi44NTkzMjAyLDE1LjYzMTAxMzIgODQuMjE4NTA1NiwxNi4xODgxODk3IDg2Ljc0MzA0NjgsMTYuMTg4MTg5NyBDOTAuMzE2MTcwNCwxNi4xODgxODk3IDkxLjczMzg2MTQsMTQuNjExNzE5MSA5MS43MzM4NjE0LDEyLjI2ODg5NTYiIGlkPSJTaGFwZSIgZmlsbD0iIzUwNUY3OSI+PC9wYXRoPjxwb2x5Z29uIGlkPSJTaGFwZSIgZmlsbD0iIzUwNUY3OSIgcG9pbnRzPSI0Ni40Mzk5OTg2IDMuMzgwMDAwMTEgNDYuNDM5OTk4NiAxNi4wMDI1ODgzIDUyLjU0NjkzODcgMTYuMDAyNTg4MyA1My41MDg0NzYyIDEzLjI3NDM1MzEgNDkuNDMwNDQ0MyAxMy4yNzQzNTMxIDQ5LjQzMDQ0NDMgMy4zODAwMDAxMSI+PC9wb2x5Z29uPjxwb2x5Z29uIGlkPSJTaGFwZSIgZmlsbD0iIzUwNUY3OSIgcG9pbnRzPSIzNC4zNjk5OTg5IDMuMzgwMDAwMTEgMzQuMzY5OTk4OSA2LjEwODAwMDExIDM3LjY3MTI4NTQgNi4xMDgwMDAxMSAzNy42NzEyODU0IDE2LjAwMjU4ODMgNDAuNjYxNzMxMSAxNi4wMDI1ODgzIDQwLjY2MTczMTEgNi4xMDgwMDAxMSA0NC4xOTYwODg4IDYuMTA4MDAwMTEgNDQuMTk2MDg4OCAzLjM4MDAwMDExIj48L3BvbHlnb24+PHBhdGggZD0iTTMwLjAzODIwNjEsMy4zODAwMDAxMSBMMjYuMTE5MDQzMSwzLjM4MDAwMDExIEwyMS42NzAwMDAxLDE2LjAwMjU4ODMgTDI1LjA2NzYwNjgsMTYuMDAyNTg4MyBMMjUuNjk4MzI1OSwxMy44NzY3MDYgQzI3LjI1MTY4NzMsMTQuMzI3OTY2OSAyOC45MDM0MjE0LDE0LjMyNzk2NjkgMzAuNDU2NzgyOCwxMy44NzY3MDYgTDMxLjA4NzUwMTksMTYuMDAyNTg4MyBMMzQuNDg1ODIyMiwxNi4wMDI1ODgzIEwzMC4wMzgyMDYxLDMuMzgwMDAwMTEgWiBNMjguMDc4NTA1NywxMS42MDA0NzA3IEMyNy41MjUwNTYsMTEuNjAwNDM5IDI2Ljk3NDQ1NywxMS41MjIwNzY2IDI2LjQ0MzQ0MDIsMTEuMzY3NzY0OCBMMjguMDc4NTA1Nyw1Ljg1OTI5NDIzIEwyOS43MTM1NzEyLDExLjM2OTY0NzIgQzI5LjE4MjQ2MDksMTEuNTIzMzIyMSAyOC42MzE4NjM3LDExLjYwMTA1MDMgMjguMDc4NTA1NywxMS42MDA0NzA3IEwyOC4wNzg1MDU3LDExLjYwMDQ3MDcgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjNTA1Rjc5Ij48L3BhdGg+PHBhdGggZD0iTTYzLjA2Nzk2ODksMy4zODAwMDAxMSBMNTkuMTQ5MDQzOCwzLjM4MDAwMDExIEw1NC43MDAwMDA4LDE2LjAwMjU4ODMgTDU4LjA5ODMyMSwxNi4wMDI1ODgzIEw1OC43MjkwNDAxLDEzLjg3NjcwNiBDNjAuMjgyNDAxNSwxNC4zMjc5NjY5IDYxLjkzNDEzNTYsMTQuMzI3OTY2OSA2My40ODc0OTcsMTMuODc2NzA2IEw2NC4xMTgyMTYxLDE2LjAwMjU4ODMgTDY3LjUxNjUzNjMsMTYuMDAyNTg4MyBMNjMuMDY3OTY4OSwzLjM4MDAwMDExIFogTTYxLjEwODUwNjQsMTEuNjAwNDcwNyBDNjAuNTU1MDU2NywxMS42MDA0MzkgNjAuMDA0NDU3NiwxMS41MjIwNzY2IDU5LjQ3MzQ0MDgsMTEuMzY3NzY0OCBMNjEuMTA4NTA2NCw1Ljg1OTI5NDIzIEw2Mi43NDM1NzE5LDExLjM2OTY0NzIgQzYyLjIxMjQ2MTYsMTEuNTIzMzIyMSA2MS42NjE4NjQ0LDExLjYwMTA1MDMgNjEuMTA4NTA2NCwxMS42MDA0NzA3IEw2MS4xMDg1MDY0LDExLjYwMDQ3MDcgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjNTA1Rjc5Ij48L3BhdGg+PHBhdGggZD0iTTEwOC44Mzc5NjksMy4zODAwMDAxMSBMMTA0LjkxOTA0NCwzLjM4MDAwMDExIEwxMDAuNDcwMDAxLDE2LjAwMjU4ODMgTDEwMy44NjgzMjEsMTYuMDAyNTg4MyBMMTA0LjQ5OTA0MSwxMy44NzY3MDYgQzEwNi4wNTI0MDIsMTQuMzI3OTY2OSAxMDcuNzA0MTM2LDE0LjMyNzk2NjkgMTA5LjI1NzQ5NywxMy44NzY3MDYgTDEwOS44ODgyMTcsMTYuMDAyNTg4MyBMMTEzLjI4Njc3NSwxNi4wMDI1ODgzIEwxMDguODM3OTY5LDMuMzgwMDAwMTEgWiBNMTA2Ljg3NzMxOCwxMS42MDA0NzA3IEMxMDYuMzIzODY4LDExLjYwMDQzOSAxMDUuNzczMjY5LDExLjUyMjA3NjYgMTA1LjI0MjI1MiwxMS4zNjc3NjQ4IEwxMDYuODc3MzE4LDUuODU5Mjk0MjMgTDEwOC41MTIzODMsMTEuMzY5NjQ3MiBDMTA3Ljk4MTI3MywxMS41MjMzMjIxIDEwNy40MzA2NzYsMTEuNjAxMDUwMyAxMDYuODc3MzE4LDExLjYwMDQ3MDcgTDEwNi44NzczMTgsMTEuNjAwNDcwNyBaIiBpZD0iU2hhcGUiIGZpbGw9IiM1MDVGNzkiPjwvcGF0aD48L2c+PC9nPjwvZz4KPC9zdmc+) center bottom no-repeat;
            background-size: 127px 24px;
        }

        footer .logo:hover,
        footer .logo:active,
        footer .logo:focus {
            background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEyN3B4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAxMjcgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0Ni4yICg0NDQ5NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+PHRpdGxlPkF0bGFzc2lhbiBob3Jpem9udGFsIGJsdWUgZ3JhZGllbnQgLSBzbWFsbDwvdGl0bGU+PGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSI5OS42ODQ3MTYlIiB5MT0iMTUuODEzODEyOCUiIHgyPSIzOS44NDQ0Mzk5JSIgeTI9Ijk3LjQzODgzODglIiBpZD0ibGluZWFyR3JhZGllbnQtMSI+PHN0b3Agc3RvcC1jb2xvcj0iIzAwNTJDQyIgb2Zmc2V0PSIwJSI+PC9zdG9wPjxzdG9wIHN0b3AtY29sb3I9IiMyNjg0RkYiIG9mZnNldD0iOTIuMyUiPjwvc3RvcD48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48ZyBpZD0iMjRweC1Ib3Jpem9udGFsLShzbWFsbCkiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGlkPSJBdGxhc3NpYW4taG9yaXpvbnRhbC1ibHVlLWdyYWRpZW50LS0tc21hbGwiIGZpbGwtcnVsZT0ibm9uemVybyI+PGcgaWQ9IkF0bGFzc2lhbi1ob3Jpem9udGFsLXdoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwgNC4wMDAwMDApIj48cGF0aCBkPSJNNC42MDMzNTA3LDcuNzQxNTQ2MiBDNC41MDk1NzU4OCw3LjYyMDE0MjYgNC4zNTg0ODY5LDcuNTU2MDU2NCA0LjIwNDk1MDU5LDcuNTcyNTYwMDMgQzQuMDUxNDE0MjcsNy41ODkwNjM2NSAzLjkxNzc2Miw3LjY4Mzc1NjY5IDMuODUyNTI4Niw3LjgyMjI1MjA4IEwwLjA0Nzk5ODYzOTksMTUuMzQ3ODk5MSBDLTAuMDIyNDcwNDI5OSwxNS40ODczNTA2IC0wLjAxNDkzNzU4ODQsMTUuNjUyOTU3MiAwLjA2NzkwNzI3NzcsMTUuNzg1NTgyNyBDMC4xNTA3NTIxNDQsMTUuOTE4MjA4MyAwLjI5NzA5NzA2MywxNS45OTg5NDMyIDAuNDU0Njg0MDMzLDE1Ljk5ODk1OCBMNS43NTIyOTYzOSwxNS45OTg5NTggQzUuOTI1NjQ4NDEsMTYuMDAyOTM5NyA2LjA4NTA3NzY2LDE1LjkwNTQ0MTggNi4xNTg5ODE3OSwxNS43NTAyNTIxIEM3LjMwMTc0Mzk2LDEzLjQxNDAxNjggNi42MDkxODk2NSw5Ljg2MTc4MTQ5IDQuNjAzMzUwNyw3Ljc0MTU0NjIgWiIgaWQ9IlNoYXBlIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTEpIj48L3BhdGg+PHBhdGggZD0iTTcuMzkwNjM3MDUsMC44OTE0MjM5MTMgQzUuNDYyMDY1NTMsMy44MjcyNjU0OCA1LjIzOTQ3OTAxLDcuNTUxMTY1ODUgNi44MDQ4NjczOSwxMC42OTE0MjM5IEw5LjM1ODg5OTIyLDE1Ljc0NTA3MSBDOS40MzU5MTU5MiwxNS44OTc0Nzk2IDkuNTkzMzU1NDYsMTUuOTkzNzYwNyA5Ljc2NTU4NDYyLDE1Ljk5Mzc3NjkgTDE1LjA2MjI0NTcsMTUuOTkzNzc2OSBDMTUuMjE5ODMyNiwxNS45OTM3NjIxIDE1LjM2NjE3NzYsMTUuOTEzMDI3MiAxNS40NDkwMjI0LDE1Ljc4MDQwMTYgQzE1LjUzMTg2NzMsMTUuNjQ3Nzc2MSAxNS41Mzk0MDAxLDE1LjQ4MjE2OTUgMTUuNDY4OTMxMSwxNS4zNDI3MTggQzE1LjQ2ODkzMTEsMTUuMzQyNzE4IDguMzQzMTM3MDUsMS4yNDEzMDYyNyA4LjE2NDA1Mjc4LDAuODg4NjAwMzg0IEM4LjA5MTgwMjE3LDAuNzQyMTAwMTcyIDcuOTQxMjEyNTUsMC42NDk0MDE1MDEgNy43NzY0NDk3NCwwLjY1MDAwMzAwNSBDNy42MTE2ODY5MiwwLjY1MDYwNDUwOSA3LjQ2MTc5Mjg5LDAuNzQ0NDAwMTY0IDcuMzkwNjM3MDUsMC44OTE0MjM5MTMgTDcuMzkwNjM3MDUsMC44OTE0MjM5MTMgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjMjY4NEZGIj48L3BhdGg+PHBhdGggZD0iTTY5LjUxODI2NjksNi45Mjc5NTQ0MSBDNjkuNTE4MjY2OSw4Ljc5MTQ4MzgyIDcwLjM5MjA0NTksMTAuMjcxMDEzMiA3My44MDk4NjgsMTAuOTI0MTg5NyBDNzUuODQ5MDAyOCwxMS4zNDc3MTkxIDc2LjI3NjE0MTQsMTEuNjczMzY2MiA3Ni4yNzYxNDE0LDEyLjM0NTgzNjggQzc2LjI3NjE0MTQsMTIuOTk5MDEzMiA3NS44NDgwNTE1LDEzLjQyMTgzNjggNzQuNDExODA5OSwxMy40MjE4MzY4IEM3Mi42NzU5MzEsMTMuMzkwOTU4NiA3MC45NzQ3NTY4LDEyLjkzNTUzOCA2OS40NTk5OTkxLDEyLjA5NjE4OTcgTDY5LjQ1OTk5OTEsMTUuMTMxNDgzOCBDNzAuNDg5MzE3NCwxNS42MzEwMTMyIDcxLjg0ODUwMjgsMTYuMTg4MTg5NyA3NC4zNzMwNDQsMTYuMTg4MTg5NyBDNzcuOTQ2MTY3NiwxNi4xODgxODk3IDc5LjM2Mzg1ODYsMTQuNjExNzE5MSA3OS4zNjM4NTg2LDEyLjI2ODg5NTYgTTc5LjM2Mzg1ODYsMTIuMjY4ODk1NiBDNzkuMzYzODU4NiwxMC4wNTk0ODM4IDc4LjE3OTIzODgsOS4wMjE4MzY3NiA3NC44MzkxODY0LDguMzExMjQ4NTMgQzcyLjk5NDM1NjgsNy45MDc3MTkxMiA3Mi41NDc3MTYzLDcuNTA0NDI1IDcyLjU0NzcxNjMsNi45Mjc5NTQ0MSBDNzIuNTQ3NzE2Myw2LjE5ODU0MjY1IDczLjIwNzkyNjEsNS44OTA1NDI2NSA3NC40MzEzMTE4LDUuODkwNTQyNjUgQzc1LjkwNzI3MDYsNS44OTA1NDI2NSA3Ny4zNjM3Mjc1LDYuMzMyNDI1IDc4Ljc0MjQxNDgsNi45NDcyNDg1MyBMNzguNzQyNDE0OCw0LjA0NjA3MjA2IEM3Ny40MjA0MDk5LDMuNDUwNzY5MzcgNzUuOTgwNjAzOSwzLjE1NTQwODc5IDc0LjUyODM0NTUsMy4xODE2MDE0NyBDNzEuMjI3MDU5LDMuMTgxNjAxNDcgNjkuNTE4MjY2OSw0LjYwMzI0ODUzIDY5LjUxODI2NjksNi45Mjc5NTQ0MSIgaWQ9IlNoYXBlIiBmaWxsPSIjMDA1MkNDIj48L3BhdGg+PHBvbHlnb24gaWQ9IlNoYXBlIiBmaWxsPSIjMDA1MkNDIiBwb2ludHM9IjExNS40MTk5OTggMy4zODAwMDAxMSAxMTUuNDE5OTk4IDE2LjAwMjU4ODMgMTE4LjEzODYwNyAxNi4wMDI1ODgzIDExOC4xMzg2MDcgNi4zNzcxNzY1OSAxMTkuMjg0NDYxIDguOTMyMjM1NDEgMTIzLjEyOTQyMSAxNi4wMDI1ODgzIDEyNi41NDcyNDMgMTYuMDAyNTg4MyAxMjYuNTQ3MjQzIDMuMzgwMDAwMTEgMTIzLjgyODYzNSAzLjM4MDAwMDExIDEyMy44Mjg2MzUgMTEuNTI2MTE3OCAxMjIuNzk5MzE3IDkuMTYyODIzNjQgMTE5LjcxMTU5OSAzLjM4MDAwMDExIj48L3BvbHlnb24+PHJlY3QgaWQ9IlJlY3RhbmdsZS1wYXRoIiBmaWxsPSIjMDA1MkNDIiB4PSI5NS4xNjAwMDM3IiB5PSIzLjM4MDAwMDExIiB3aWR0aD0iMi45NzExODE2NSIgaGVpZ2h0PSIxMi42MjI1ODgyIj48L3JlY3Q+PHBhdGggZD0iTTkxLjczMzg2MTQsMTIuMjY4ODk1NiBDOTEuNzMzODYxNCwxMC4wNTk0ODM4IDkwLjU0OTI0MTUsOS4wMjE4MzY3NiA4Ny4yMDkxODkxLDguMzExMjQ4NTMgQzg1LjM2NDM1OTUsNy45MDc3MTkxMiA4NC45MTc3MTkxLDcuNTA0NDI1IDg0LjkxNzcxOTEsNi45Mjc5NTQ0MSBDODQuOTE3NzE5MSw2LjE5ODU0MjY1IDg1LjU3NzkyODgsNS44OTA1NDI2NSA4Ni44MDEzMTQ2LDUuODkwNTQyNjUgQzg4LjI3NzI3MzQsNS44OTA1NDI2NSA4OS43MzM3MzAzLDYuMzMyNDI1IDkxLjExMjQxNzYsNi45NDcyNDg1MyBMOTEuMTEyNDE3Niw0LjA0NjA3MjA2IEM4OS43OTA0MTI2LDMuNDUwNzY5MzcgODguMzUwNjA2NiwzLjE1NTQwODc5IDg2Ljg5ODM0ODMsMy4xODE2MDE0NyBDODMuNTk3MDYxOCwzLjE4MTYwMTQ3IDgxLjg4ODI2OTYsNC42MDMyNDg1MyA4MS44ODgyNjk2LDYuOTI3OTU0NDEgQzgxLjg4ODI2OTYsOC43OTE0ODM4MiA4Mi43NjIwNDg2LDEwLjI3MTAxMzIgODYuMTc5ODcwNywxMC45MjQxODk3IEM4OC4yMTkwMDU2LDExLjM0NzcxOTEgODguNjQ2MTQ0MiwxMS42NzMzNjYyIDg4LjY0NjE0NDIsMTIuMzQ1ODM2OCBDODguNjQ2MTQ0MiwxMi45OTkwMTMyIDg4LjIxODA1NDMsMTMuNDIxODM2OCA4Ni43ODE4MTI3LDEzLjQyMTgzNjggQzg1LjA0NTkzMzcsMTMuMzkwOTU4NiA4My4zNDQ3NTk1LDEyLjkzNTUzOCA4MS44MzAwMDE4LDEyLjA5NjE4OTcgTDgxLjgzMDAwMTgsMTUuMTMxNDgzOCBDODIuODU5MzIwMiwxNS42MzEwMTMyIDg0LjIxODUwNTYsMTYuMTg4MTg5NyA4Ni43NDMwNDY4LDE2LjE4ODE4OTcgQzkwLjMxNjE3MDQsMTYuMTg4MTg5NyA5MS43MzM4NjE0LDE0LjYxMTcxOTEgOTEuNzMzODYxNCwxMi4yNjg4OTU2IiBpZD0iU2hhcGUiIGZpbGw9IiMwMDUyQ0MiPjwvcGF0aD48cG9seWdvbiBpZD0iU2hhcGUiIGZpbGw9IiMwMDUyQ0MiIHBvaW50cz0iNDYuNDM5OTk4NiAzLjM4MDAwMDExIDQ2LjQzOTk5ODYgMTYuMDAyNTg4MyA1Mi41NDY5Mzg3IDE2LjAwMjU4ODMgNTMuNTA4NDc2MiAxMy4yNzQzNTMxIDQ5LjQzMDQ0NDMgMTMuMjc0MzUzMSA0OS40MzA0NDQzIDMuMzgwMDAwMTEiPjwvcG9seWdvbj48cG9seWdvbiBpZD0iU2hhcGUiIGZpbGw9IiMwMDUyQ0MiIHBvaW50cz0iMzQuMzY5OTk4OSAzLjM4MDAwMDExIDM0LjM2OTk5ODkgNi4xMDgwMDAxMSAzNy42NzEyODU0IDYuMTA4MDAwMTEgMzcuNjcxMjg1NCAxNi4wMDI1ODgzIDQwLjY2MTczMTEgMTYuMDAyNTg4MyA0MC42NjE3MzExIDYuMTA4MDAwMTEgNDQuMTk2MDg4OCA2LjEwODAwMDExIDQ0LjE5NjA4ODggMy4zODAwMDAxMSI+PC9wb2x5Z29uPjxwYXRoIGQ9Ik0zMC4wMzgyMDYxLDMuMzgwMDAwMTEgTDI2LjExOTA0MzEsMy4zODAwMDAxMSBMMjEuNjcwMDAwMSwxNi4wMDI1ODgzIEwyNS4wNjc2MDY4LDE2LjAwMjU4ODMgTDI1LjY5ODMyNTksMTMuODc2NzA2IEMyNy4yNTE2ODczLDE0LjMyNzk2NjkgMjguOTAzNDIxNCwxNC4zMjc5NjY5IDMwLjQ1Njc4MjgsMTMuODc2NzA2IEwzMS4wODc1MDE5LDE2LjAwMjU4ODMgTDM0LjQ4NTgyMjIsMTYuMDAyNTg4MyBMMzAuMDM4MjA2MSwzLjM4MDAwMDExIFogTTI4LjA3ODUwNTcsMTEuNjAwNDcwNyBDMjcuNTI1MDU2LDExLjYwMDQzOSAyNi45NzQ0NTcsMTEuNTIyMDc2NiAyNi40NDM0NDAyLDExLjM2Nzc2NDggTDI4LjA3ODUwNTcsNS44NTkyOTQyMyBMMjkuNzEzNTcxMiwxMS4zNjk2NDcyIEMyOS4xODI0NjA5LDExLjUyMzMyMjEgMjguNjMxODYzNywxMS42MDEwNTAzIDI4LjA3ODUwNTcsMTEuNjAwNDcwNyBMMjguMDc4NTA1NywxMS42MDA0NzA3IFoiIGlkPSJTaGFwZSIgZmlsbD0iIzAwNTJDQyI+PC9wYXRoPjxwYXRoIGQ9Ik02My4wNjc5Njg5LDMuMzgwMDAwMTEgTDU5LjE0OTA0MzgsMy4zODAwMDAxMSBMNTQuNzAwMDAwOCwxNi4wMDI1ODgzIEw1OC4wOTgzMjEsMTYuMDAyNTg4MyBMNTguNzI5MDQwMSwxMy44NzY3MDYgQzYwLjI4MjQwMTUsMTQuMzI3OTY2OSA2MS45MzQxMzU2LDE0LjMyNzk2NjkgNjMuNDg3NDk3LDEzLjg3NjcwNiBMNjQuMTE4MjE2MSwxNi4wMDI1ODgzIEw2Ny41MTY1MzYzLDE2LjAwMjU4ODMgTDYzLjA2Nzk2ODksMy4zODAwMDAxMSBaIE02MS4xMDg1MDY0LDExLjYwMDQ3MDcgQzYwLjU1NTA1NjcsMTEuNjAwNDM5IDYwLjAwNDQ1NzYsMTEuNTIyMDc2NiA1OS40NzM0NDA4LDExLjM2Nzc2NDggTDYxLjEwODUwNjQsNS44NTkyOTQyMyBMNjIuNzQzNTcxOSwxMS4zNjk2NDcyIEM2Mi4yMTI0NjE2LDExLjUyMzMyMjEgNjEuNjYxODY0NCwxMS42MDEwNTAzIDYxLjEwODUwNjQsMTEuNjAwNDcwNyBMNjEuMTA4NTA2NCwxMS42MDA0NzA3IFoiIGlkPSJTaGFwZSIgZmlsbD0iIzAwNTJDQyI+PC9wYXRoPjxwYXRoIGQ9Ik0xMDguODM3OTY5LDMuMzgwMDAwMTEgTDEwNC45MTkwNDQsMy4zODAwMDAxMSBMMTAwLjQ3MDAwMSwxNi4wMDI1ODgzIEwxMDMuODY4MzIxLDE2LjAwMjU4ODMgTDEwNC40OTkwNDEsMTMuODc2NzA2IEMxMDYuMDUyNDAyLDE0LjMyNzk2NjkgMTA3LjcwNDEzNiwxNC4zMjc5NjY5IDEwOS4yNTc0OTcsMTMuODc2NzA2IEwxMDkuODg4MjE3LDE2LjAwMjU4ODMgTDExMy4yODY3NzUsMTYuMDAyNTg4MyBMMTA4LjgzNzk2OSwzLjM4MDAwMDExIFogTTEwNi44NzczMTgsMTEuNjAwNDcwNyBDMTA2LjMyMzg2OCwxMS42MDA0MzkgMTA1Ljc3MzI2OSwxMS41MjIwNzY2IDEwNS4yNDIyNTIsMTEuMzY3NzY0OCBMMTA2Ljg3NzMxOCw1Ljg1OTI5NDIzIEwxMDguNTEyMzgzLDExLjM2OTY0NzIgQzEwNy45ODEyNzMsMTEuNTIzMzIyMSAxMDcuNDMwNjc2LDExLjYwMTA1MDMgMTA2Ljg3NzMxOCwxMS42MDA0NzA3IEwxMDYuODc3MzE4LDExLjYwMDQ3MDcgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjMDA1MkNDIj48L3BhdGg+PC9nPjwvZz48L2c+Cjwvc3ZnPg==);
            background-size: 127px 24px;
        }
    </style>
</head>
<body>
    <div class="section">
        <div class="header">
            <div class="bitbucket-logo">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 65 65">
                    <defs>
                        <style>
                            .cls-4{fill:url(#blue-gradient);}
                        </style>
                        <linearGradient id="blue-gradient" x1="0" y1="0" x2="65" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="rotate(0 32 32)">
                            <stop offset="0" stop-color="#2684ff"></stop>
                            <stop offset="1" stop-color="#0052cc"></stop>
                            <animateTransform attributeName="gradientTransform" attributeType="XML" type="rotate" values="0,32,32;360,32,32" repeatCount="indefinite" dur="3s"></animateTransform>
                        </linearGradient>
                    </defs>
                    <title>Bitbucket-blue</title>
                    <path class="cls-4" d="M2,6.26A2,2,0,0,0,0,8.58L8.49,60.12a2.72,2.72,0,0,0,2.66,2.27H51.88a2,2,0,0,0,2-1.68L62.37,8.59a2,2,0,0,0-2-2.32ZM37.75,43.51h-13L21.23,25.12H40.9Z"></path>
                    <path class="cls-4" d="M59.67,25.12H40.9L37.75,43.51h-13L9.4,61.73a2.71,2.71,0,0,0,1.75.66H51.89a2,2,0,0,0,2-1.68Z"></path>
                </svg>
                <script>
                    {
                        const grad = document.getElementById('blue-gradient');
                        const gradStyle = getComputedStyle(grad);
                        if (gradStyle.msAnimationName === gradStyle.animationName) {
                            //IE fallback
                            const start = performance.now();
                            const animate = function(time) {
                                const progress = ((time - start) % 3000)/3000;
                                const angle = progress * 360;
                                grad.setAttribute('gradientTransform', 'rotate(' + angle + ',32,32)');
                                requestAnimationFrame(animate);
                            };
                            animate(start);
                        }
                    }
                </script>
            </div>
            <h1><%= Product.FULL_NAME %> is starting up</h1>
        </div>

        <p class="message"><span id="message"><%= progress.getMessage() %></span></p>

        <div class="progress-bar"><span id="progress" class="progress-indicator" style="width:<%= progress.getPercentage() %>%"></span></div>
    </div>
    <footer>
        <a href="http://www.atlassian.com" target="_blank" class="logo">Atlassian</a>
    </footer>
    <script>
        (function(){
            var contextPath = '<%= servletContext.getContextPath() %>';
            var messageEl = document.querySelector('#message');
            var progressEl = document.querySelector('#progress');

            function setMessage(msg) {
                messageEl.setAttribute('title', msg);
                messageEl.textContent = msg;
            }

            function setProgress(pct) {
                var val = pct != null ? pct + '%' : null;
                progressEl.style.width = val;
            }

            setTimeout(function poll() {
                var request = new XMLHttpRequest();

                request.onload = function() {
                    var serviceUnavailable = request.status === 503;
                    var json;
                    var message = 'Starting up Bitbucket';
                    var percentage = null;

                    if (this.responseText) {
                        json = JSON.parse(this.responseText);
                        var progress = json.progress;

                        message = progress.message;
                        percentage = progress.percentage;
                    }

                    progressEl.className = 'progress-indicator' + (serviceUnavailable ? ' unknown' : '');
                    setMessage(message);
                    setProgress(percentage);

                    // If the server is starting, or we're waiting to contact the service, continue to poll.
                    if (json && json.state === 'STARTING' || serviceUnavailable) {
                        setTimeout(poll, 500);
                    } else {
                        // When the server's state moves from STARTING to anything else, reload the page.
                        // This is better than checking progress because it handles startup failure
                        location.reload()
                    }
                };

                request.open('get', contextPath + '/system/startup', true);
                request.setRequestHeader('Accept', 'application/json');
                // Set the if-modified-since header to the current time to prevent
                // some browsers from caching the request results.
                request.setRequestHeader("If-Modified-Since", new Date().toUTCString());
                request.send();
            }, 500);
        }());
    </script>
</body>
</html>
