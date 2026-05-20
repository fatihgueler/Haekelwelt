using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Haekelwelt.Blazor.Data.Entities;

namespace Haekelwelt.Blazor.Services;

public class CurrentUserService(
    AuthenticationStateProvider authProvider,
    UserManager<ApplicationUser> userManager)
{
    public async Task<ApplicationUser?> GetAsync()
    {
        var state = await authProvider.GetAuthenticationStateAsync();
        var id = state.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id)) return null;
        return await userManager.FindByIdAsync(id);
    }

    public async Task<string?> GetIdAsync()
    {
        var state = await authProvider.GetAuthenticationStateAsync();
        return state.User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    public async Task<bool> IsAuthenticatedAsync()
    {
        var state = await authProvider.GetAuthenticationStateAsync();
        return state.User.Identity?.IsAuthenticated == true;
    }
}
