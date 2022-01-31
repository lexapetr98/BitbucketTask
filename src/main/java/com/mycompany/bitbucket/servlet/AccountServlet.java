package com.mycompany.bitbucket.servlet;

import com.atlassian.bitbucket.user.ApplicationUser;
import com.atlassian.bitbucket.user.UserService;
import com.atlassian.plugin.spring.scanner.annotation.export.ExportAsService;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.soy.renderer.SoyException;
import com.atlassian.soy.renderer.SoyTemplateRenderer;
import com.google.common.collect.ImmutableMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@ExportAsService
@Component
public class AccountServlet extends HttpServlet{
    private static final Logger log = LoggerFactory.getLogger(AccountServlet.class);

    private final SoyTemplateRenderer soyTemplateRenderer;
    private final UserService userService;

    @Autowired
    public AccountServlet(@ComponentImport final SoyTemplateRenderer soyTemplateRenderer, @ComponentImport final UserService userService) {
        this.soyTemplateRenderer = soyTemplateRenderer;
        this.userService = userService;
    }

    @Override
    protected void doGet(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException
    {
        String pathInfo = req.getPathInfo();
        String userSlug = pathInfo.substring(1);
        ApplicationUser user = userService.getUserBySlug(userSlug);
        if (user == null) {
            resp.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        render(resp, "plugin.account.accountTab", ImmutableMap.<String, Object>of("user", user));
    }

    private void render(final HttpServletResponse resp, final String templateName, final Map<String, Object> data) throws IOException, ServletException {
        resp.setContentType("text/html;charset=UTF-8");
        try {
            soyTemplateRenderer.render(resp.getWriter(),"com.mycompany.bitbucket.bitbucket-profile-plugin:account-soy", templateName, data);
        } catch (SoyException e) {
            Throwable cause = e.getCause();
            if (cause instanceof IOException) {
                throw (IOException) cause;
            }
            throw new ServletException(e);
        }
    }

}